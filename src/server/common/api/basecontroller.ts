import type { Router } from "express";
import type { Route, RouteMapping } from "../../@types";

/**
 * The base controller class, meant to enforce a standard for every controller that is made, must contain these 2 methods
 */
export type BaseController = {
	ROUTE_PREFIX: string;
	getRouteMapping: () => RouteMapping;
	addRoutes: (_router: Router) => void;
};

/**
 * Adds all routes in the route mapping to the router instance, instead of putting this logic in app.ts, put the logic in the controller
 *
 * @param _router - The router instance from app.ts
 * @param routeMapping - The route mappings from the controller
 * @param routePrefix - The route prefix the controller instantiated
 */
export const updateRoutes = (
	_router: Router,
	routeMapping: RouteMapping,
	routePrefix: string,
	// eslint-disable-next-line sonarjs/cognitive-complexity -- disabled
): void => {
	for (const eachKey of Object.keys(routeMapping)) {
		const routes: Route[] = routeMapping[eachKey];
		switch (eachKey) {
			case "get": {
				for (const eachRoute of routes) {
					if (eachRoute[2] && eachRoute[2].length > 0) {
						// with middleware
						_router.post(
							`${routePrefix}${eachRoute[0]}`,
							...eachRoute[2],
							eachRoute[1],
						);
					} else {
						// without middleware
						_router.get(
							`${routePrefix}${eachRoute[0]}`,
							eachRoute[1],
						);
					}
				}
				break;
			}
			case "put": {
				for (const eachRoute of routes) {
					if (eachRoute[2] && eachRoute[2].length > 0) {
						// with middleware
						_router.post(
							`${routePrefix}${eachRoute[0]}`,
							...eachRoute[2],
							eachRoute[1],
						);
					} else {
						// without middleware
						_router.put(
							`${routePrefix}${eachRoute[0]}`,
							eachRoute[1],
						);
					}
				}
				break;
			}
			case "post": {
				for (const eachRoute of routes) {
					if (eachRoute[2] && eachRoute[2].length > 0) {
						// with middleware
						_router.post(
							`${routePrefix}${eachRoute[0]}`,
							...eachRoute[2],
							eachRoute[1],
						);
					} else {
						// without middleware
						_router.post(
							`${routePrefix}${eachRoute[0]}`,
							eachRoute[1],
						);
					}
				}
				break;
			}
			case "delete": {
				for (const eachRoute of routes) {
					if (eachRoute[2] && eachRoute[2].length > 0) {
						// with middleware
						_router.post(
							`${routePrefix}${eachRoute[0]}`,
							...eachRoute[2],
							eachRoute[1],
						);
					} else {
						// without middleware
						_router.delete(
							`${routePrefix}${eachRoute[0]}`,
							eachRoute[1],
						);
					}
				}
				break;
			}
			default: {
				break;
			}
		}
	}
};
