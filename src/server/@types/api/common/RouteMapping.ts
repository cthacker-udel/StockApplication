import type { Route } from "./Route";

export type RouteMapping = {
	get?: Route;
	post?: Route;
	put?: Route;
	delete?: Route;
} & { [key: string]: Route };
