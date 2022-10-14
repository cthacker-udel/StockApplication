import { pbkdf2Sync, randomBytes, randomInt, webcrypto } from "node:crypto";
import { SECRETS } from "../../secrets";

/**
 * Local type for the encryption result, only applies to the encryption here
 */
type EncryptionResult = {
	salt: string;
	iterations: number;
	hash: string;
};

/**
 * Randomly encrypts the password, storing the iterations and salt in the database alongside the user
 *
 * @param message - The message to encrypt, is randomly generated values for encryption
 * @returns The encrypted password
 */
export const pbkdf2Encryption = (message: string): EncryptionResult => {
	const salt = randomBytes(128).toString("base64");
	const iterations = randomInt(1000, 10_000);
	const hash = pbkdf2Sync(message, salt, iterations, 512, "sha256").toString(
		"hex",
	);
	return {
		hash,
		iterations,
		salt,
	};
};

/**
 * Fixed encryption, used mainly for verification
 *
 * @param message - The message to encrypt
 * @param iterations - The # of iterations to use in the encryption
 * @param salt - The salt to encrypt the password with
 * @returns The encrypted message
 */
export const fixedPbkdf2Encryption = (
	message: string,
	iterations: number,
	salt: string,
): string =>
	pbkdf2Sync(message, salt, iterations, 512, "sha256").toString("hex");

/**
 * Generates a random 64 byte token
 *
 * @returns A randomized 64 byte token, used anyplace tokens are involved
 */
export const generateToken = (): string => randomBytes(64).toString("hex");

/**
 * AES encrypts the message
 *
 * @param message - The message to encrypt
 * @returns The encrypted message
 */
const aesEncrypt = async (message: string): Promise<string> =>
	new TextDecoder("utf8").decode(
		await webcrypto.subtle.encrypt(
			{
				counter: SECRETS.AES_COUNTER,
				length: 64,
				name: "AES-CTR",
			},
			{
				algorithm: { name: "AES-CTR" },
				extractable: true,
				type: "secret",
				usages: ["encrypt"],
			},
			new TextEncoder().encode(`${message}:${SECRETS.AES_KEY}`),
		),
	);

/**
 * Decrypts the AES encrypted message
 *
 * @param encryptedMessage - The AES encrypted message
 * @returns The decrypted message
 */
const aesDecrypt = async (encryptedMessage: string): Promise<string> =>
	new TextDecoder("utf8").decode(
		await webcrypto.subtle.decrypt(
			{
				counter: SECRETS.AES_COUNTER,
				length: 64,
				name: "AES-CTR",
			},
			{
				algorithm: { name: "AES-CTR" },
				extractable: true,
				type: "secret",
				usages: ["encrypt"],
			},
			new TextEncoder().encode(encryptedMessage),
		),
	);
