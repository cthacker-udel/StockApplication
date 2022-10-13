/* eslint-disable wrap-regex -- not needed*/
import type { User } from "../../@types";
import { BaseService } from "../../common";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";
import { pbkdf2Encryption } from "../encryption";
import { fixedPbkdf2Encryption } from "../encryption/encryption";

export class UserService extends BaseService {
	public constructor() {
		super("user");
	}

	public signUp = async (
		client: StockMongoClient,
		userInformation: User,
	): Promise<boolean> => {
		const { username, password, dob, firstName, lastName } =
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
			const foundUser = await userCollection.findOne<User>({ username });
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
				return generatedLoginInformationHash === foundUserPassword;
			}
		}
		return false;
	};
}
