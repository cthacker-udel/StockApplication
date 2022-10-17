/* eslint-disable @typescript-eslint/no-unsafe-argument -- not needed */
/* eslint-disable indent -- not needed for this */
/* eslint-disable @typescript-eslint/indent -- not needed for this */
import type { NextFunction, Request, Response } from "express";

export const asyncMiddlewareHandler =
	(
		function_: (..._arguments: any) => Promise<any>,
		...functionArguments: any[]
	) =>
	(request: Request, response: Response, next: NextFunction) => {
		function_(request, response, next, ...functionArguments).catch(next);
	};
