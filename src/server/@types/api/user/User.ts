export type User = {
	firstName: string;
	lastName: string;
	dob: string;
	username: string;
	password: string;
	lastLogin: string;
	// pbkdf2 algorithm information
	salt: string;
	iterations: number;
};
