/* eslint-disable indent -- disabled */
/* eslint-disable @typescript-eslint/indent -- disabled */
import type { Role, User, Session } from "../../@types";
import {
	type Roles,
	RolesRequestHeader,
	generateApiMessage,
} from "../../common";
import type { NextFunction, Request, Response } from "express";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";
import { ObjectId } from "mongodb";
import { SECRETS } from "../../secrets";

export const rolesInjector =
	(
		requiredRole: Roles | undefined,
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
		console.log("checking roles");
		const headerValue = request.header(RolesRequestHeader);
		if (requiredRole) {
			if (headerValue === undefined) {
				response.status(400);
				response.send(generateApiMessage("Roles not specified"));
			} else {
				const database = client
					.getClient()
					.db(MONGO_COMMON.DATABASE_NAME);
				const roleCollection = database.collection("roles");
				const userCollection = database.collection("user");
				const foundRole = await roleCollection.findOne<Role>(
					new ObjectId(headerValue),
				);
				if (foundRole) {
					const sessionHeader = request.header(
						SECRETS.STOCK_APP_SESSION_COOKIE_ID,
					) as string;
					const parsedUser = JSON.parse(sessionHeader) as Session;
					const isAllowed: User | null =
						await userCollection.findOne<User>({
							roles: { $all: [headerValue] },
							username: parsedUser.username,
						});
					if (isAllowed === null) {
						response.status(400);
						response.send(generateApiMessage("Role not allowed"));
					} else {
						next();
					}
				} else {
					response.status(400);
					response.send(
						generateApiMessage("Role sent is not specified"),
					);
				}
			}
		} else {
			next();
		}
	};
