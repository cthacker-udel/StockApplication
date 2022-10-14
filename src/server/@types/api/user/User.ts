export type User = {
	firstName: string;
	lastName: string;
	dob: string;
	username: string;
	email: string;
	password: string;
	lastLogin: string;
	token: string;

	// pbkdf2 algorithm information
	salt: string;
	iterations: number;
};
