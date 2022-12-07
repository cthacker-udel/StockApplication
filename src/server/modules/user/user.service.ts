/* eslint-disable class-methods-use-this -- disabled */
/* eslint-disable wrap-regex -- not needed*/
import type {
	FoundUserEmailByUsernameReturn,
	LeaderboardUser,
	OwnedStock,
	Role,
	User,
	UserAggregateData,
} from "../../@types";
import {
	BaseService,
	Roles,
	generateRandomBalance,
	API_CONSTANTS,
} from "../../common";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";
import { pbkdf2Encryption, fixedPbkdf2Encryption } from "../encryption";
import { v4 } from "uuid";
import { RolesService } from "../roles";
import {
	withUsername,
	withUsernamePotentialProfit,
	computeOverallValueFromPortfolio,
} from "../../modules";
import type { ObjectId } from "mongodb";

/**
 * Handles all database logic for user involved database actions
 */
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
			console.log("test 0");
			return false;
		}
		if (/\W+/giu.test(username)) {
			console.log("test 1");
			return false;
		}
		if (
			/[ ]+/giu.test(password) ||
			/^\w{0,6}$/giu.test(password) ||
			!/\d/giu.test(password) ||
			!/\W/giu.test(password)
		) {
			console.log("test 2");
			return false;
		}
		if (
			new Date(Date.now()).getUTCFullYear() -
			new Date(dob).getUTCFullYear() < 21 ||
			Number.isNaN(Date.parse(dob))
		) {
			console.log("test 3");
			return false;
		}
		if (firstName && !/\S/giu.test(firstName.trim())) {
			return false;
		}
		if (lastName && !/\S/giu.test(lastName.trim())) {
			return false;
		}
		if (
			email?.trim() &&
			!/^[a-zA-Z0-9-.]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]{2,4}$/giu.test(
				email.trim(),
			)
		) {
			console.log("test 4");
			return false;
		}
		const { hash, iterations, salt } = pbkdf2Encryption(password);
		const balance = generateRandomBalance();
		const insertionResult = await userCollection.insertOne({
			...userInformation,
			balance,
			iterations,
			lastLogin: new Date(Date.now()).toUTCString(),
			password: hash,
			portfolio: API_CONSTANTS.BASE_PORTFOLIO,
			salt,
		});
		if (insertionResult.acknowledged) {
			await RolesService.addRoleToUser(client, Roles.USER, username);
		}
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
					{ $set: { sessionToken: v4() } },
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

	public doesUserWithUsernameExist = async (
		client: StockMongoClient,
		username: string,
	): Promise<boolean> => {
		if (username === undefined) {
			return false;
		}
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		return (await userCollection.findOne<User>({ username })) !== null;
	};

	/**
	 * Fetches the user with the username provided
	 *
	 * @param client - The mongo client
	 * @param username - The username to find the user by
	 * @returns The found user
	 */
	public getUserDataWithUsername = async (
		client: StockMongoClient,
		username: string,
	): Promise<Partial<User> | undefined> => {
		if (username === undefined) {
			return undefined;
		}
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const rolesCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("roles");
		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser === null) {
			return undefined;
		}
		const { roles } = foundUser;
		const rolePromises = [];
		for (const eachRoleId of roles) {
			rolePromises.push(
				rolesCollection.findOne<Role>({
					_id: eachRoleId,
				}),
			);
		}
		const foundRoles = await Promise.all(rolePromises);
		const formattedRoles = foundRoles
			.filter((eachItem: Role | null) => eachItem !== null)
			.map(
				(eachRole: Role | null) => (eachRole as Role).perm,
			) as number[];
		const maxValue =
			formattedRoles.length > 0 ? Math.max(...formattedRoles) : -1;

		const {
			password: _pass,
			salt: _salt,
			iterations: _iter,
			sessionToken: _session,
			roles: _roles,
			token: _token,
			...rest
		} = foundUser;
		return { ...rest, roles: [maxValue.toString()] };
	};

	public getUserAggregateDataWithUsername = async (
		client: StockMongoClient,
		username: string,
	): Promise<UserAggregateData | undefined> => withUsername(client, username);

	public getUserPotentialProfit = async (
		client: StockMongoClient,
		username: string,
	): Promise<Partial<UserAggregateData> | undefined> =>
		withUsernamePotentialProfit(client, username);

	public getUserOwnedStockWithUsername = async (
		client: StockMongoClient,
		username: string,
	): Promise<OwnedStock[]> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser === null) {
			return [];
		}
		return foundUser.portfolio.stocks;
	};

	public getUsernameFromObjectId = async (
		client: StockMongoClient,
		id: ObjectId,
	): Promise<User | undefined> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const foundUser = await userCollection.findOne<User>({ _id: id });
		if (foundUser === null) {
			return;
		}
		return foundUser;
	};

	public compareToLeaderboardUsers = async (
		client: StockMongoClient,
		user: Partial<User>,
	): Promise<boolean> => {
		const leaderboardCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("leaderboard");
		const foundUsers = await leaderboardCollection
			.find<LeaderboardUser>({})
			.toArray();
		if (foundUsers.length < 5) {
			const doesUserAlreadyExist =
				leaderboardCollection.findOne<LeaderboardUser>({
					username: user.username,
				});
			if (doesUserAlreadyExist === null) {
				await leaderboardCollection.insertOne(user);
				return true;
			}
			return false;
		}
		if (user.portfolio !== undefined) {
			const currentUserTotal = computeOverallValueFromPortfolio(
				user.portfolio,
			);
			let foundIndex = -1;
			let loopIndex = 0;
			for (const eachUser of foundUsers) {
				if (eachUser.totalValue < currentUserTotal) {
					foundIndex = loopIndex;
					break;
				}
				loopIndex += 1;
			}
			const removedUser = foundUsers[foundIndex];
			const deleteResult = await leaderboardCollection.deleteOne({
				username: removedUser.username,
			});
			const insertedUser: LeaderboardUser = {
				rank: removedUser.rank,
				totalValue: currentUserTotal,
				username: user.username ?? "",
			};
			const insertionResult = await leaderboardCollection.insertOne(
				insertedUser,
			);
			return (
				deleteResult.deletedCount === 1 && insertionResult.acknowledged
			);
		}
		return false;
	};
}
