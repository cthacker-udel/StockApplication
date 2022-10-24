/* eslint-disable sonarjs/cognitive-complexity -- disabled */
/* eslint-disable indent -- disabled */
/* eslint-disable @typescript-eslint/indent -- disabled */

import type { Role, User } from "../../@types";
import { type Roles, generateApiMessage } from "../../common";
import type { NextFunction, Request, Response } from "express";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";
import { ObjectId } from "mongodb";
import { SECRETS } from "../../secrets";

/**
 * A function that validates the roles given a required role, and a client, used as middleware.
 *
 * @param requiredRole - The required role
 * @param client - The mongo client, used for database access
 * @returns A middleware function with the plugged in requiredRole and MongoDB client
 */
export const rolesValidator =
	(
		requiredRole: Roles,
		client: StockMongoClient,
	): ((
		_request: Request,
		_response: Response,
		_next: NextFunction,
	) => Promise<void>) =>
	async (
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> => {
		// access roles from user, see if roles align with requiredRole
		if (requiredRole) {
			const database = client.getClient().db(MONGO_COMMON.DATABASE_NAME);
			const roleCollection = database.collection("roles");
			const userCollection = database.collection("user");
			if (
				request.header(SECRETS.STOCK_APP_SESSION_COOKIE_ID) ===
				undefined
			) {
				response.status(401);
				response.send(
					generateApiMessage(
						"No session cookie, roles not able to be validated",
					),
				);
			} else {
				const parsedUsername = request.header(
					SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
				);
				const foundUser = await userCollection.findOne<User>({
					username: parsedUsername,
				});
				const foundRolePromises = [];
				if (foundUser?.roles) {
					for (const eachRoleId of foundUser.roles) {
						foundRolePromises.push(
							roleCollection.findOne<Role>({
								_id: new ObjectId(eachRoleId),
							}),
						);
					}
					const foundPromises = await Promise.all(foundRolePromises);
					if (foundPromises.length > 0) {
						const mappedRoles = foundPromises.map(
							(eachRole) => eachRole?.perm,
						);
						if (mappedRoles.includes(requiredRole)) {
							response.status(200);
							next();
						} else {
							response.status(401);
							response.send(
								generateApiMessage("User has invalid perms"),
							);
						}
					} else {
						response.status(401);
						response.send(
							generateApiMessage("User has invalid roles"),
						);
					}
				} else {
					response.status(401);
					response.send(
						generateApiMessage("User has no roles permitted"),
					);
				}
			}
		} else {
			next();
		}
	};
