/* eslint-disable wrap-regex -- not needed*/
import type { FoundUserEmailByUsernameReturn, User } from "../../@types";
import { BaseService } from "../../common";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";
import { pbkdf2Encryption } from "../encryption";
import { fixedPbkdf2Encryption } from "../encryption/encryption";
import { v4 } from "uuid";

export class UserService extends BaseService {
	public constructor() {
		super("user");
	}

	/**
	 * Signs a user up
	 *
	 * @param client - The mongo client
	 * @param userInformation - The user information
	 * @returns Whether the user has been signed up or not
	 */
	public signUp = async (
		client: StockMongoClient,
		userInformation: User,
	): Promise<boolean> => {
		const { username, password, dob, firstName, lastName, email } =
			userInformation;
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const doesUserAlreadyExist = await userCollection.findOne<User>({
			username,
		});
		if (doesUserAlreadyExist) {
			return false;
		}
		if (/\W+/giu.test(username)) {
			return false;
		}
		if (
			/[ ]+/giu.test(password) ||
			/^\w{0,6}$/giu.test(password) ||
			!/\d/giu.test(password) ||
			!/\W/giu.test(password)
		) {
			return false;
		}
		if (
			new Date(dob).getUTCFullYear() -
				new Date(Date.now()).getUTCFullYear() <
				-21 ||
			Number.isNaN(Date.parse(dob))
		) {
			return false;
		}
		if (!firstName || !/\S/giu.test(firstName.trim())) {
			return false;
		}
		if (!lastName || !/S/giu.test(lastName.trim())) {
			return false;
		}
		if (
			email !== undefined &&
			!email.trim() &&
			!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/giu.test(email.trim())
		) {
			return false;
		}
		const { hash, iterations, salt } = pbkdf2Encryption(password);
		const insertionResult = await userCollection.insertOne({
			...userInformation,
			iterations,
			lastLogin: new Date(Date.now()).toUTCString(),
			password: hash,
			salt,
		});
		return insertionResult.acknowledged;
	};

	/**
	 * Logs a user in
	 *
	 * @param client - The mongo client
	 * @param loginInformation - The login information the user supplies
	 * @returns Whether the user is logged in or not
	 */
	public login = async (
		client: StockMongoClient,
		loginInformation: Partial<User>,
	): Promise<boolean> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const { username, password } = loginInformation;
		if (username !== undefined && password !== undefined) {
			const foundUser = await userCollection.findOne<User>({
				username,
			});
			if (foundUser !== null) {
				// user exists, grab hashing information
				const {
					iterations,
					password: foundUserPassword,
					salt,
				} = foundUser;
				const generatedLoginInformationHash = fixedPbkdf2Encryption(
					password,
					iterations,
					salt,
				);
				const addSessionTokenResult = await userCollection.updateOne(
					{ username },
					{ sessionToken: v4() },
				);
				return (
					addSessionTokenResult.modifiedCount > 0 &&
					generatedLoginInformationHash === foundUserPassword
				);
			}
		}
		return false;
	};

	/**
	 * Finds a user's email given their username
	 *
	 * @param client - The mongo client
	 * @param username - The user's username we are using to find their email
	 * @returns The user's email
	 */
	public findUserEmailByUsername = async (
		client: StockMongoClient,
		username: string,
	): Promise<FoundUserEmailByUsernameReturn> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser) {
			const { email, ..._rest } = foundUser;
			return { email };
		}
		return { email: undefined };
	};

	/**
	 * Adds a token to the user, returns true if it succeeds, false otherwise
	 *
	 * @param client - The mongo client
	 * @param username - The username to add the token to
	 * @param token - The token to add to the user
	 * @returns Whether the token was added or not
	 */
	public addToken = async (
		client: StockMongoClient,
		username: string,
		token: string,
	): Promise<boolean> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const foundUser = await userCollection.findOneAndUpdate(
			{ username },
			{ $set: { token } },
		);
		return foundUser.ok > 0;
	};

	/**
	 * Changes the password of the user
	 *
	 * @param client - The mongo client
	 * @param username - The username of the requester
	 * @param requestToken - The change password token
	 * @param newPassword - The new password the user is
	 * @returns Whether the password was changed or not
	 */
	public changePassword = async (
		client: StockMongoClient,
		username: string,
		requestToken: string,
		newPassword: string,
	): Promise<boolean> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser === null) {
			return false;
		}
		if (
			/[ ]+/giu.test(newPassword) ||
			/^\w{0,6}$/giu.test(newPassword) ||
			!/\d/giu.test(newPassword) ||
			!/\W/giu.test(newPassword)
		) {
			return false;
		}
		const { token } = foundUser;
		if (token === requestToken) {
			const { hash, iterations, salt } = pbkdf2Encryption(newPassword);
			await userCollection.findOneAndUpdate(
				{ username },
				{ $set: { iterations, password: hash, salt, token: "" } },
			);
			return true;
		}
		return false;
	};

	/**
	 * Gets a users portfolio
	 *
	 * @param client - The mongo client
	 * @param username - The username to add the token to
	 * @returns Returns the user's portfolio
	 */
	/**
	TODO: Fetch user's portfolio from database
	public getPortfolio = async (
		client: StockMongoClient,
		username: string,
	): Promise<Boolean> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		
			const foundUser = await userCollection.findOne<User>({ username });
			if (foundUser) {
				//return { [1, 2, 3] };
			}
		return true;
	};
	*/
}