import type { Role, User, Session } from "@types";
import { type Roles, RolesRequestHeader } from "common";
import type { NextFunction, Request, Response } from "express";
import { MONGO_COMMON, type StockMongoClient } from "mongo";
import { ObjectId } from "mongodb";
import { SECRETS } from "secrets";

export const rolesInjector = async (
	request: Request,
	response: Response,
	next: NextFunction,
	requiredRole: Roles | undefined,
	client: StockMongoClient,
): Promise<void> => {
	const headerValue = request.header(RolesRequestHeader);
	if (requiredRole) {
		if (headerValue === undefined) {
			throw new Error("Role permission not supplied");
		} else {
			const database = client.getClient().db(MONGO_COMMON.DATABASE_NAME);
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
					throw new Error("Role is not allowed");
				} else {
					next();
				}
			} else {
				throw new Error("Role sent is not valid");
			}
		}
	} else {
		next();
	}
};
