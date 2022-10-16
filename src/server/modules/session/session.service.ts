import type { RedisClientType } from "redis";
import type { Response } from "express";
import type { Collection } from "mongodb";
import type { User } from "../../@types";
import type { Session } from "../../@types/api/session";
import type { RedisSession } from "../../@types/api/session/RedisSession";
import { BaseService } from "../../common";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";
import { SECRETS } from "../../secrets";
import { validate, v4 } from "uuid";

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
		// eslint-disable-next-line sonarjs/cognitive-complexity -- refactor later, off by 1
	): Promise<boolean> => {
		if (validate(id)) {
			const sessionCollection: Collection = this.stockMongoClient
				.getClient()
				.db(MONGO_COMMON.DATABASE_NAME)
				.collection(this.COLLECTION_NAME);
			const foundSession = sessionCollection.findOne<Session>({
				id,
				username,
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
								sessionToken,
								username,
							});
						if (
							matchedUser !== null &&
							matchedUser.sessionToken === sessionToken
						) {
							// re-enter session into cache to restart expiration
							await this.redisClient.setEx(
								id,
								SECRETS.REDIS_EXPIRATION,
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

	public addSession = async (
		username: string,
		sessionToken: string,
		response: Response,
	): Promise<boolean> => {
		const userCollection: Collection = this.stockMongoClient
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);

		const foundUser = await userCollection.findOne<User>({
			sessionToken,
			username,
		});

		if (foundUser !== null) {
			const id = v4();
			response.cookie(
				SECRETS.STOCK_APP_SESSION_COOKIE_ID,
				JSON.stringify({ id, username }),
			);
			await this.redisClient.setEx(
				id,
				SECRETS.REDIS_EXPIRATION,
				JSON.stringify({ sessionToken, username }),
			);
			return true;
		}
		return false;
	};
}
