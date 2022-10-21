/* eslint-disable @typescript-eslint/no-unsafe-member-access -- not needed */
import { Roles, RolesRequestHeader } from "common";
import { NextFunction, Request, Response } from "express";
import { SECRETS } from "secrets";

export const rolesInjector = (
	request: Request,
	response: Response,
	next: NextFunction,
	requiredRole: Roles,
): void => {
	const rolesValue = request.header(RolesRequestHeader);
	const session = request?.cookies[
		SECRETS.STOCK_APP_SESSION_COOKIE_ID
	] as unknown as string;
	if (rolesValue && session) {
		// found role in header
	}
};
