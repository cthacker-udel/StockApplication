import type { User } from "../../@types";

export const sanitizeUserInfo = (user: User): Partial<User> => {
	const {
		password: _pass,
		token: _token,
		salt: _salt,
		iterations: _iter,
		sessionToken: _session,
		...rest
	} = user;
	return rest;
};
