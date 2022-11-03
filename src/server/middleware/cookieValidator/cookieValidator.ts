import type { NextFunction, Request, Response } from "express";
import { SECRETS } from "../../secrets";
import type { SessionService } from "../../modules/session";
import { generateApiMessage } from "../../common";
import { mockCookieManager } from "../../common/api/mockCookieManager";
import type { SessionCookie } from "../../@types/api/session/SessionCookie";

export const cookieValidator = async (
	request: Request,
	response: Response,
	next: NextFunction,
	sessionService: SessionService,
) => {
	if (request.header(SECRETS.STOCK_APP_SESSION_COOKIE_ID) === undefined) {
		next();
	} else {
		const sessionUsername = mockCookieManager.getCookie(
			request,
			SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
		);
		if (sessionUsername === undefined) {
			response.status(401);
			response.send(
				generateApiMessage("No username detected in headers"),
			);
		}
		const parsedSessionUsername = JSON.parse(
			sessionUsername as string,
		) as SessionCookie;
		const result = await sessionService.validateSession(
			parsedSessionUsername.value,
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
