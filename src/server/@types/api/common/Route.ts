/* eslint-disable @typescript-eslint/indent -- prettier/eslint conflict */
import type { RequestHandler } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";

/**
 * Representation of an api route
 */
export type Route = [
	path: string,
	handler: RequestHandler<
		ParamsDictionary,
		any,
		any,
		Query,
		{ [key: string]: any }
	>,
];
