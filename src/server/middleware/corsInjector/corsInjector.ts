import { corsHeaders } from "../../common/api/corsHeaders";
import type { NextFunction, Request, Response } from "express";

export const corsInjector = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	response.header({
		"Access-Control-Allow-Origin":
			corsHeaders["Access-Control-Allow-Origin"],
	});
	response.header({
		"Access-Control-Allow-Headers":
			corsHeaders["Access-Control-Allow-Headers"],
	});
	response.header({
		"Access-Control-Allow-Methods":
			corsHeaders["Access-Control-Allow-Methods"],
	});
	response.header({
		"Access-Control-Allow-Credentials": true,
	});
	next();
};
