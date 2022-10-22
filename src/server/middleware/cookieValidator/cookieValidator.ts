/* eslint-disable @typescript-eslint/no-unsafe-member-access -- disabled for readability of code */
import type { NextFunction, Request, Response } from "express";
import { SECRETS } from "../../secrets";
import type { SessionService } from "../../modules/session";
import { generateApiMessage } from "../../common";

export const cookieValidator = async (
	request: Request,
	response: Response,
	next: NextFunction,
	sessionService: SessionService,
) => {
	console.log(request.headers);
	if (
		request.cookies?.[SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID] ===
		undefined
	) {
		next();
	} else {
		const sessionUsername = request.cookies[
			SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
		] as string;
		const result = await sessionService.validateSession(
			sessionUsername,
			request,
			response,
		);
		if (result) {
			next();
		} else {
			response.status(401);
			response.send(generateApiMessage("Invalid cookie detected"));
		}
	}
};
