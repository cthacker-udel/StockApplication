import type { Router } from "express";
import type { RouteMapping } from "../../@types";

/**
 * The base controller class, meant to enforce a standard for every controller that is made, must contain these 2 methods
 */
export type BaseController = {
	getRouteMapping: () => RouteMapping;
	addRoutes: (_router: Router) => void;
};
