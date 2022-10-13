import { pbkdf2Sync, randomBytes, randomInt } from "node:crypto";

type EncryptionResult = {
	salt: string;
	iterations: number;
	hash: string;
};

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

export const fixedPbkdf2Encryption = (
	message: string,
	iterations: number,
	salt: string,
): string =>
	pbkdf2Sync(message, salt, iterations, 512, "sha256").toString("hex");
