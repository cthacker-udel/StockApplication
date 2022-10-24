import type { Request, Response } from "express";
import { SECRETS } from "../../secrets";

const addCookie = (
	response: Response,
	id: string,
	value: string,
	values?: { [key: string]: string },
): void => {
	if (values) {
		response.header(
			id,
			JSON.stringify({
				...values,
				value,
			}),
		);
	} else {
		response.header(
			id,
			JSON.stringify({
				value,
			}),
		);
	}
};

const getCookie = (request: Request, id: string) => request.headers[id];

const generateExpirationDateUTCString = (expiration: number) =>
	new Date(Date.now() + expiration).toUTCString();

const removeCookies = (response: Response) => {
	const value = "";
	response.header(
		SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
		JSON.stringify({ value }),
	);
	response.header(
		SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
		JSON.stringify({ value }),
	);
};

export const mockCookieManager = {
	addCookie,
	generateExpirationDateUTCString,
	getCookie,
	removeCookies,
};
