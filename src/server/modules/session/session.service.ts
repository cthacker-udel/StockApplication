import type { RedisClientType } from "redis";
import type { Response } from "express";
import type { Collection } from "mongodb";
import type { User } from "server/@types";
import type { Session } from "server/@types/api/session";
import type { RedisSession } from "server/@types/api/session/RedisSession";
import { BaseService } from "server/common";
import { MONGO_COMMON, type StockMongoClient } from "server/mongo";
import { SECRETS } from "server/secrets";
import { validate, v4 } from "uuid";

export class SessionService extends BaseService {
	private readonly redisClient: RedisClientType;
	private readonly stockMongoClient: StockMongoClient;

	/**
	 * The constructor for the session service, used to manage the user sessions
	 *
	 * @param _stockMongoClient - The mongo client
	 * @param _redisClient - The redis client
	 */
	constructor(
		_stockMongoClient: StockMongoClient,
		_redisClient: RedisClientType,
	) {
		super("session");
		this.redisClient = _redisClient;
		this.stockMongoClient = _stockMongoClient;
	}

	/**
	 * Validates the session
	 *
	 * @param username - The username to validate the session with
	 * @param id - The id of the session to find in the session collection that belongs to the user
	 * @returns Whether or not the session is valid
	 */
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

	/**
	 * Adds a session to the client in the database as well as in the cookies
	 *
	 * @param username - The username to add to the cache entry
	 * @param sessionToken - The session token to do the validation steps with, ensuring that the user has logged in
	 * @param response - The server response, used to add cookies to the client
	 * @returns
	 */
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
				{ maxAge: SECRETS.REDIS_EXPIRATION },
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

	/**
	 * Removes a session cache key corresponding to the id passed into the removeSession
	 *
	 * @param username - The username to search with the id
	 * @param id - The id of the cache key
	 * @returns Whether or not the cache key was removed
	 */
	public removeSession = async (
		username: string,
		id: string,
	): Promise<boolean> => {
		const userCollection = this.stockMongoClient
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);

		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser === null) {
			return false;
		}
		await this.redisClient.del(id);
		return true;
	};
}
