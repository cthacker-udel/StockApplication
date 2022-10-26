import type { SessionCookie } from "../../@types/api/session/SessionCookie";
import { mockCookieManager } from "../../common/api/mockCookieManager";
import type { Request, Response } from "express";
import type { Collection } from "mongodb";
import { v4, validate } from "uuid";
import type { User } from "../../@types";
import { BaseService } from "../../common";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";
import { SECRETS } from "../../secrets";
import { fixedPbkdf2Encryption } from "../encryption/encryption";

export class SessionService extends BaseService {
	private readonly stockMongoClient: StockMongoClient;

	/**
	 * The constructor for the session service, used to manage the user sessions
	 *
	 * @param _stockMongoClient - The mongo client
	 */
	constructor(_stockMongoClient: StockMongoClient) {
		super("user"); // not a session collection, but should always be connected to the user collection
		this.stockMongoClient = _stockMongoClient;
	}

	/**
	 *
	 * @param username - The username to update the session with
	 * @param response - The response to assign/remove the cookies, to create a new session
	 * @returns
	 */
	public updateSession = async (
		username: string,
		response: Response,
	): Promise<boolean> => {
		const userCollection = this.stockMongoClient
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser === null) {
			return false;
		} else if (foundUser?.sessionToken === undefined) {
			// session doesn't exist but user does
			await this.addSession(username, response);
			return true;
		}
		const { iterations, salt, sessionToken } = foundUser;
		const hashedKey = fixedPbkdf2Encryption(
			`${username}${sessionToken}`,
			iterations,
			salt,
		);
		mockCookieManager.addCookie(
			response,
			SECRETS.STOCK_APP_SESSION_COOKIE_ID,
			hashedKey,
			{ username },
		);
		return true;
	};

	/**
	 * Validates the session
	 *
	 * @param username - The username to validate the session with
	 * @param request - The request to analyze the cookie with
	 * @returns Whether or not the session is valid
	 */
	public validateSession = async (
		username: string,
		request: Request,
		response: Response,
	): Promise<boolean> => {
		const userCollection = this.stockMongoClient
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser === null || foundUser?.sessionToken === undefined) {
			return false;
		}
		// user found
		const { iterations, salt, sessionToken } = foundUser;
		const generatedHash = fixedPbkdf2Encryption(
			`${username}${sessionToken}`,
			iterations,
			salt,
		);
		// generate hash from username and sessionToken
		const sentCookie = request.header(SECRETS.STOCK_APP_SESSION_COOKIE_ID);
		if (sentCookie === undefined) {
			return false;
		}
		const parsedCookie = JSON.parse(sentCookie) as SessionCookie;
		const parsedCookieDate = new Date(parsedCookie.expiration);
		if (parsedCookieDate === undefined) {
			return false;
		}
		const comparison = parsedCookieDate.getTime() - Date.now();
		if (comparison > 0) {
			const result = generatedHash === parsedCookie.value;
			if (result && validate(sessionToken)) {
				return true;
			}
			await this.removeSession(username, response);
		} else {
			// has cookie but is outdated, then refresh the token
			await this.updateSession(username, response);
			return true;
		}
		return false;
	};

	/**
	 * Adds a session to the client in the database as well as in the cookies
	 *
	 * @param username - The username to add to the cache entry
	 * @param response - The server response, used to add cookies to the client
	 * @returns
	 */
	public addSession = async (
		username: string,
		response: Response,
	): Promise<boolean> => {
		const userCollection: Collection = this.stockMongoClient
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);

		const foundUser = await userCollection.findOne<User>({
			username,
		});

		if (foundUser !== null) {
			const { iterations, salt } = foundUser;
			const id = v4();
			const generatedHash = fixedPbkdf2Encryption(
				`${username}${id}`,
				iterations,
				salt,
			);
			mockCookieManager.addCookie(
				response,
				SECRETS.STOCK_APP_SESSION_COOKIE_ID,
				generatedHash,
				{
					expiration:
						mockCookieManager.generateExpirationDateUTCString(
							SECRETS.STOCK_APP_SESSION_COOKIE_EXPIRATION,
						),
				},
			);
			mockCookieManager.addCookie(
				response,
				SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
				foundUser.username,
				{
					expiration:
						mockCookieManager.generateExpirationDateUTCString(
							SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_EXPIRATION,
						),
				},
			);
			await userCollection.updateOne(
				{ username },
				{ $set: { ...foundUser, sessionToken: id } },
			);
			return true;
		}
		await this.removeSession(username, response);
		return false;
	};

	/**
	 * Removes a session from the cookie and the database
	 *
	 * @param username - The username to search with the id
	 * @param response - The response to remove the cookie from
	 * @returns Whether or not the session was removed
	 */
	public removeSession = async (
		username: string,
		response: Response,
	): Promise<boolean> => {
		const userCollection = this.stockMongoClient
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);

		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser === null) {
			return false;
		}

		await userCollection.updateOne(
			{ username },
			{ $set: { sessionToken: undefined } },
		);
		mockCookieManager.removeCookies(response);
		return true;
	};
}
