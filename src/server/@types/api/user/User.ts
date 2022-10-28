import type { Portfolio } from "../portfolio";

export type User = {
	firstName: string;
	lastName: string;
	dob: string;
	username: string;
	email: string;
	password: string;

	// Un-required fields for signup
	token: string;
	lastLogin: string;
	salt: string;
	iterations: number;
	sessionToken: string;
	roles: string[]; // the roleIds

	// account balance
	balance: number;

	// trade records
	portfolio: Portfolio;
};
