import type { Request, Response, Router } from "express";
import type { Route, RouteMapping, Stock } from "../../@types";
import {
	type BaseController,
	ERROR_CODE_ENUM,
	generateApiMessage,
} from "../../common";
import type { StockMongoClient } from "../../mongo";
import { StockService } from "./stock.service";

/**
 * Handles all incoming requests related to the "stock" endpoint
 */
export class StockController implements BaseController {
	/**
	 * Prefix for the route
	 */
	private readonly ROUTE_PREFIX = "/stock/";
	/**
	 * The service instance
	 */
	private readonly stockService: StockService;
	/**
	 * The MongoClient instance
	 */
	private readonly client: StockMongoClient;

	/**
	 * Instantiates an instance of the stock controller
	 *
	 * @param client - MongoClient instance to pass into the service
	 */
	public constructor(client: StockMongoClient) {
		this.stockService = new StockService();
		this.client = client;
	}

	/**
	 * Gets a stock with the supplied `id` that is added into the query string
	 *
	 * @param request - The request sent to the server
	 * @param response - The response from the server
	 */
	public getStockById = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const foundStock: Stock | undefined =
				await this.stockService.getStockById(
					this.client,
					request.query?.id as string,
				);
			response.status(200);
			response.send(
				foundStock
					? JSON.stringify(foundStock)
					: generateApiMessage("No stocks available"),
			);
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
	 * Gets a stock by the symbol
	 *
	 * @param request - The request sent to the server
	 * @param response - The response sent back to the client
	 */
	public getStockBySymbol = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const { symbol } = request.query;
		try {
			response.status(200);
			response.send(
				await this.stockService.getStockBySymbol(
					this.client,
					symbol as string,
				),
			);
		} catch (error: unknown) {
			console.error(
				`Error finding stock by symbol ${(error as Error).message}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					`Failed to find stock with symbol ${symbol}`,
					false,
					ERROR_CODE_ENUM.FIND_STOCK_FAILURE,
				),
			);
		}
	};

	/**
	 * Gets all stocks given a price
	 *
	 * @param request - The server request
	 * @param response - The server response
	 */
	public getAllStocksByPrice = async (
		request: Request,
		response: Response,
	) => {
		try {
			const { price } = request.query;
			if (price as unknown as number) {
				const parsedPrice = Number.parseInt(price as string, 10);
				response.status(200);
				response.send(
					await this.stockService.getAllStocksWithPrice(
						this.client,
						parsedPrice,
					),
				);
			}
		} catch (error: unknown) {
			console.error(
				`Error finding stock by symbol ${(error as Error).message}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to fetch all stocks with the price",
					false,
					ERROR_CODE_ENUM.FIND_STOCK_BY_PRICE_FAILURE,
				),
			);
		}
	};

	public getAllStocks = async (request: Request, response: Response) => {
		try {
			response.status(200);
			response.send(await this.stockService.getAllStocks(this.client));
		} catch (error: unknown) {
			console.error(
				`Error fetching all stocks ${(error as Error).message}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to fetch all stocks",
					false,
					ERROR_CODE_ENUM.FIND_ALL_STOCKS_FAILURE,
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
			const payload: Stock = request.body as Stock;
			if (payload?.symbol.length > 3) {
				console.error(
					"Error occurred adding stock, symbol length must be between 1 and 3 characters",
				);
				response.status(400);
				response.send(
					generateApiMessage(
						"Stock symbol must be between 1 and 3 characters",
						false,
						ERROR_CODE_ENUM.CREATE_STOCK_VALIDATION_FAILURE_SYMBOL,
					),
				);
			} else if (
				await this.stockService.getStockBySymbol(
					this.client,
					payload.symbol,
				)
			) {
				console.error("Stock with stock symbol already exists");
				response.status(400);
				response.send(
					generateApiMessage(
						"Stock with stock symbol already exists",
						false,
						ERROR_CODE_ENUM.CREATE_STOCK_STOCK_ALREADY_EXISTS,
					),
				);
			} else {
				await this.stockService.addStock(this.client, payload);
				response.status(204);
				response.send(JSON.stringify({}));
			}
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
		get: [
			["get/id", this.getStockById],
			["get/symbol", this.getStockBySymbol],
			["get/price", this.getAllStocksByPrice],
			["get/all", this.getAllStocks],
		],
		post: [["add", this.addStock]],
	});

	/**
	 * Adds all routes in the route mapping to the router instance, instead of putting this logic in app.ts, put the logic in the controller
	 *
	 * @param _router - The router instance from app.ts
	 */
	public addRoutes = (_router: Router) => {
		const routeMapping: RouteMapping = this.getRouteMapping();
		for (const eachKey of Object.keys(routeMapping)) {
			const routes: Route[] = routeMapping[eachKey];
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
