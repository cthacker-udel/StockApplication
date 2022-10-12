import type { Request, Response, Router } from "express";
import type { RouteMapping, Stock } from "src/server/@types";
import type { Route } from "src/server/@types/api/common/Route";
import { generateApiMessage } from "src/server/common";
import type { BaseController } from "src/server/common/api/basecontroller";
import { ERROR_CODE_ENUM } from "src/server/common/api/errorcodes";
import type { StockMongoClient } from "src/server/mongo";
import { StockService } from "./stock.service";

export class StockController implements BaseController {
	private readonly ROUTE_PREFIX = "stock/";
	private readonly stockService: StockService;
	private readonly client: StockMongoClient;

	public constructor(client: StockMongoClient) {
		this.stockService = new StockService();
		this.client = client;
	}

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

	public getRouteMapping = (): RouteMapping => ({
		get: [["get", this.getStock]],
	});

	public addRoutes = (_router: Router) => {
		const routeMapping: RouteMapping = this.getRouteMapping();
		for (const eachKey of Object.keys(routeMapping)) {
			const routes: Route = routeMapping[eachKey];
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
