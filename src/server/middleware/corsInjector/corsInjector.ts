import { corsHeaders } from "../../common/api/corsHeaders";
import type { NextFunction, Request, Response } from "express";

export const corsInjector = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	console.log("cors injector");
	response.header(corsHeaders["Access-Control-Allow-Origin"]);
	response.header(corsHeaders["Access-Control-Allow-Headers"]);
	response.header(corsHeaders["Access-Control-Allow-Methods"]);
	next();
};
