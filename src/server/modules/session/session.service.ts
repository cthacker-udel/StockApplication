/* eslint-disable no-mixed-spaces-and-tabs -- prettier/eslint conflict */
/* eslint-disable indent -- prettier/eslint conflict */
/* eslint-disable @typescript-eslint/indent -- prettier/eslint conflict */
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
		response.cookie(SECRETS.STOCK_APP_SESSION_COOKIE_ID, hashedKey, {
			domain: "",
			httpOnly: false,
			maxAge: SECRETS.STOCK_APP_SESSION_COOKIE_EXPIRATION,
			sameSite: "none",
		});
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
		const { iterations, salt, sessionToken } = foundUser;
		const generatedHash = fixedPbkdf2Encryption(
			`${username}${sessionToken}`,
			iterations,
			salt,
		);
		const acquiredHash =
			request.cookies === undefined
				? ""
				: (request.cookies as { [key: string]: string })[
						SECRETS.STOCK_APP_SESSION_COOKIE_ID
				  ];
		const result = generatedHash === acquiredHash;
		if (result && validate(sessionToken)) {
			return true;
		}
		await this.removeSession(username, response);
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
			response.cookie(
				SECRETS.STOCK_APP_SESSION_COOKIE_ID,
				fixedPbkdf2Encryption(`${username}${id}`, iterations, salt),
				{
					domain: "",
					httpOnly: false,
					maxAge: SECRETS.STOCK_APP_SESSION_COOKIE_EXPIRATION,
					sameSite: "none",
				},
			);
			response.cookie(
				SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
				foundUser.username,
				{
					domain: "",
					httpOnly: false,
					maxAge: SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_EXPIRATION,
					sameSite: "none",
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
		response.clearCookie(SECRETS.STOCK_APP_SESSION_COOKIE_ID);
		return true;
	};
}
