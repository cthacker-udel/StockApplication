import type { Router } from "express";
import type { RouteMapping } from "src/server/@types";

export type BaseController = {
	getRouteMapping: () => RouteMapping;
	addRoutes: (_router: Router) => void;
};
