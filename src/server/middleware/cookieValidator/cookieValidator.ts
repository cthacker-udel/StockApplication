/* eslint-disable @typescript-eslint/no-unsafe-member-access -- disabled for readability of code */
import type { NextFunction, Request, Response } from "express";
import { SECRETS } from "../../secrets";
import type { SessionService } from "../../modules/session";
import { generateApiMessage } from "../../common";
import { mockCookieManager } from "../../common/api/mockCookieManager";

export const cookieValidator = async (
	request: Request,
	response: Response,
	next: NextFunction,
	sessionService: SessionService,
) => {
	console.log(
		"IN COOKIE VALIDATOR , headers = ",
		request.headers,
		" and ",
		request.header(SECRETS.STOCK_APP_SESSION_COOKIE_ID),
	);
	if (request.header(SECRETS.STOCK_APP_SESSION_COOKIE_ID) === undefined) {
		next();
	} else {
		const sessionUsername = mockCookieManager.getCookie(
			request,
			SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
		) as string;
		const result = await sessionService.validateSession(
			sessionUsername,
			request,
			response,
		);
		console.log("result = ", result);
		if (result) {
			next();
		} else {
			response.status(401);
			response.send(generateApiMessage("Invalid cookie detected"));
		}
	}
};
