/* eslint-disable @typescript-eslint/no-extraneous-class -- not needed */
import type { Roles } from "common";
import { MONGO_COMMON, type StockMongoClient } from "mongo";

export class RolesService {
	public static addRoleToUser = async (
		client: StockMongoClient,
		role: Roles,
		username: string,
		userRoles: string[] = [],
	): Promise<void> => {
		const roleCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("roles");
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("user");
		const foundRole = await roleCollection.findOne({ perm: role });
		if (foundRole) {
			await userCollection.updateOne(
				{ username },
				{ roles: [...userRoles, foundRole._id] },
			);
		}
	};
}
