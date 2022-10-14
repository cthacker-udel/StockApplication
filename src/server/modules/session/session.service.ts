import type { RedisClientType } from "@redis/client";
import type { Collection } from "mongodb";
import { User } from "server/@types";
import type { Session } from "server/@types/api/session";
import { RedisSession } from "server/@types/api/session/RedisSession";
import { BaseService } from "server/common";
import { MONGO_COMMON, type StockMongoClient } from "server/mongo";
import { validate } from "uuid";

export class SessionService extends BaseService {
	private readonly redisClient: RedisClientType;
	private readonly stockMongoClient: StockMongoClient;

	constructor(
		_stockMongoClient: StockMongoClient,
		_redisClient: RedisClientType,
	) {
		super("session");
		this.redisClient = _redisClient;
		this.stockMongoClient = _stockMongoClient;
	}

	public validateSession = async (
		username: string,
		id: string,
	): Promise<boolean> => {
		if (validate(id)) {
			const sessionCollection: Collection = this.stockMongoClient
				.getClient()
				.db(MONGO_COMMON.DATABASE_NAME)
				.collection(this.COLLECTION_NAME);
			const foundSession = sessionCollection.findOne<Session>({
				username,
				id,
			});
			if (foundSession !== null) {
				const redisSession = await this.redisClient.get(id);
				if (redisSession !== null) {
					const parsedRedisSession = JSON.parse(
						redisSession,
					) as RedisSession;
					if (parsedRedisSession !== undefined) {
						const { sessionToken } = parsedRedisSession;
						const matchedUser =
							await sessionCollection.findOne<User>({
								username,
								sessionToken,
							});
						if (
							matchedUser !== null &&
							matchedUser.sessionToken === sessionToken
						) {
							// re-enter session into cache to restart expiration
							this.redisClient.setEx(
								id,
								60 * 30,
								JSON.stringify(parsedRedisSession),
							);
						}
						return false;
					}
				}
				return false;
			}
			return false;
		}
		return false;
	};
}
