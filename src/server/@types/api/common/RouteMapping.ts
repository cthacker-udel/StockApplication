import type { Route } from "./Route";

/**
 * Collection of routes for each crud method
 */
export type RouteMapping = {
	get?: Route;
	post?: Route;
	put?: Route;
	delete?: Route;
} & { [key: string]: Route };
