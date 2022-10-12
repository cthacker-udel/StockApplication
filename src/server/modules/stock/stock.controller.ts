import type { Request, Response, Router } from "express";
import type { RouteMapping, Stock } from "server/@types";
import type { Route } from "server/@types/api/common/Route";
import { generateApiMessage } from "server/common";
import type { BaseController } from "server/common/api/basecontroller";
import { ERROR_CODE_ENUM } from "server/common/api/errorcodes";
import type { StockMongoClient } from "server/mongo";
import { StockService } from "./stock.service";

/**
 * Handles all incoming requests related to the "stock" endpoint
 */
export class StockController implements BaseController {
	private readonly ROUTE_PREFIX = "stock/";
	private readonly stockService: StockService;
	private readonly client: StockMongoClient;

	public constructor(client: StockMongoClient) {
		this.stockService = new StockService();
		this.client = client;
	}

	/**
	 * Gets a stock with the supplied `stockId` that is added into the query string
	 *
	 * @param request - The request sent to the server
	 * @param response - The response from the server
	 */
	public getStock = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const foundStock: Stock | undefined =
				await this.stockService.getStock(
					this.client,
					request.query?.id as string,
				);
			response.status(200);
			response.send(JSON.stringify(foundStock));
		} catch (error: unknown) {
			console.error(
				`Error occurred finding stock ${(error as Error).message}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to get stock",
					false,
					ERROR_CODE_ENUM.FIND_STOCK_FAILURE,
				),
			);
		}
	};

	/**
	 * Adds a stock via the supplied body that is converted into a Stock type, if it's malformed then an error occurs and is caught to avoid exceptions.
	 *
	 * @param request - The server request
	 * @param response - The server response
	 */
	public addStock = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const payload: Stock = JSON.parse(request.body as string) as Stock;
			await this.stockService.addStock(this.client, payload);
			response.status(204);
			response.send(JSON.stringify({}));
		} catch (error: unknown) {
			console.error(
				`Error occurred adding stock ${(error as Error).message}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to create stock",
					false,
					ERROR_CODE_ENUM.CREATE_STOCK_FAILURE,
				),
			);
		}
	};

	/**
	 * Fetches the route mapping for this controller, which will be used in app.ts
	 *
	 * @returns - The route mapping, basically an object that will be utilized by the app in making it easier to dynamically generate endpoints dependent on each of the controllers
	 */
	public getRouteMapping = (): RouteMapping => ({
		get: [["get", this.getStock]],
	});

	/**
	 * Adds all routes in the route mapping to the router instance, instead of putting this logic in app.ts, put the logic in the controller
	 *
	 * @param _router - The router instance from app.ts
	 */
	public addRoutes = (_router: Router) => {
		const routeMapping: RouteMapping = this.getRouteMapping();
		for (const eachKey of Object.keys(routeMapping)) {
			const routes: Route = routeMapping[eachKey];
			console.log("adding route", routes);
			switch (eachKey) {
				case "get": {
					for (const eachRoute of routes) {
						_router.get(
							`${this.ROUTE_PREFIX}${eachRoute[0]}`,
							eachRoute[1],
						);
					}
					break;
				}
				case "put": {
					for (const eachRoute of routes) {
						_router.put(
							`${this.ROUTE_PREFIX}${eachRoute[0]}`,
							eachRoute[1],
						);
					}
					break;
				}
				case "post": {
					for (const eachRoute of routes) {
						_router.post(
							`${this.ROUTE_PREFIX}${eachRoute[0]}`,
							eachRoute[1],
						);
					}
					break;
				}
				case "delete": {
					for (const eachRoute of routes) {
						_router.delete(
							`${this.ROUTE_PREFIX}${eachRoute[0]}`,
							eachRoute[1],
						);
					}
					break;
				}
				default: {
					break;
				}
			}
		}
	};
}
