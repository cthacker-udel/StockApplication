/* eslint-disable @typescript-eslint/no-unsafe-argument -- disabled for readability of code*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access -- disabled for readability of code */
import type { NextFunction, Request, Response } from "express";
import { SECRETS } from "../../secrets";
import type { SessionService } from "../../modules/session";

export const cookieValidator = async (
	request: Request,
	response: Response,
	next: NextFunction,
	sessionService: SessionService,
) => {
	if (
		request.cookies?.[SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID] !==
		undefined
	) {
		const sessionUsername = JSON.parse(
			request.cookies[SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID],
		) as string;
		const result = await sessionService.validateSession(
			sessionUsername,
			request,
			response,
		);
		if (!result) {
			throw new Error("Session expired");
		}
	}
	next();
};
