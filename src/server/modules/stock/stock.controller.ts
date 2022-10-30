import type { Request, Response, Router } from "express";
import { updateRoutes } from "../../common/api/basecontroller";
import type { RouteMapping, SortByOptions, Stock } from "../../@types";
import {
	type BaseController,
	ERROR_CODE_ENUM,
	generateApiMessage,
	Roles,
} from "../../common";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";
import { StockService } from "./stock.service";
import type { SessionService } from "../session";
import { rolesValidator } from "../../middleware/rolesValidator/rolesValidator";
import type { ChangeStreamUpdateDocument } from "mongodb";
import type { Server } from "socket.io";

const CONSTANTS = {
	DELETE_STOCK_ALREADY_EXISTS: "Stock with stock symbol already exists",
};

/**
 * Handles all incoming requests related to the "stock" endpoint
 */
export class StockController implements BaseController {
	/**
	 * Prefix for the route
	 */
	public readonly ROUTE_PREFIX = "/stock/";
	/**
	 * The service instance
	 */
	private readonly stockService: StockService;
	/**
	 * The MongoClient instance
	 */
	private readonly client: StockMongoClient;

	private readonly sessionService: SessionService;

	/**
	 * Instantiates an instance of the stock controller
	 *
	 * @param client - MongoClient instance to pass into the service
	 */
	public constructor(
		client: StockMongoClient,
		_sessionService: SessionService,
		_socket: Server,
	) {
		this.stockService = new StockService();
		this.client = client;
		this.sessionService = _sessionService;
		this.client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("stock")
			.watch()
			.on(
				"change",
				(changedDocument: ChangeStreamUpdateDocument): void => {
					this.stockService
						.getStockById(
							this.client,
							changedDocument.documentKey._id.toString(),
						)
						.then((result: Stock | undefined) => {
							if (result === undefined) {
								throw new Error("Unable to find updated stock");
							}
							_socket.sockets.emit("stockUpdated", result);
						})
						.catch((error: unknown) => {
							console.error(
								`Failed finding updated stock ${
									(error as Error).stack
								}`,
							);
						});
				},
			);
		_socket.on("connection", (_: any) => {
			console.log(
				`${new Date().toLocaleTimeString()} -- User listening to stock collection socket`,
			);
		});
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

	/**
	 * Gets stocks by a given name
	 *
	 * @param request - The server request
	 * @param response - The server response
	 */
	public getStocksByName = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const { name } = request.query;
		try {
			response.status(200);
			response.send(
				await this.stockService.getStocksByName(
					this.client,
					name as string,
				),
			);
		} catch (error: unknown) {
			console.error(
				`Error finding stock by symbol ${(error as Error).message}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					`Failed to find stock with Name ${name}`,
					false,
					ERROR_CODE_ENUM.FIND_STOCK_FAILURE,
				),
			);
		}
	};

	/**
	 * Gets all stocks given a number of shares
	 *
	 * @param request - The server request
	 * @param response - The server response
	 */
	public getStocksWithShares = async (
		request: Request,
		response: Response,
	) => {
		try {
			const { shares } = request.query;
			if (shares as unknown as number) {
				const parsedShares = Number.parseInt(shares as string, 10);
				response.status(200);
				response.send(
					await this.stockService.getStocksWithShares(
						this.client,
						parsedShares,
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
					"Failed to fetch all stocks with the number of shares",
					false,
					ERROR_CODE_ENUM.FIND_STOCK_BY_SHARES_FAILURE,
				),
			);
		}
	};

	/**
	 * Gets all stocks from the database
	 *
	 * @param request - The server request
	 * @param response - The server response
	 */
	public getAllStocks = async (request: Request, response: Response) => {
		try {
			const { amt } = request.query;
			response.status(200);
			response.send(
				await this.stockService.getAllStocks(
					this.client,
					amt as unknown as number,
				),
			);
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
	 * Gets all stocks for the stock dashboard page
	 *
	 * @param _request - The client request
	 * @param response - The server response
	 */
	public getStockDashboardStocks = async (
		request: Request,
		response: Response,
	) => {
		try {
			const { sortBy } = request.query;
			const result = await this.stockService.getStockDashboardStocks(
				this.client,
				sortBy as SortByOptions,
			);
			response.status(200);
			response.header({
				"Cache-Control": "stale-while-revalidate=60",
			});
			response.send({ stocks: result });
		} catch (error: unknown) {
			console.error(
				`Error fetching stock dashboard stocks ${
					(error as Error).message
				}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to fetch all stock dashboard stocks",
					false,
					ERROR_CODE_ENUM.GENERIC_ERROR,
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
			if (payload?.symbol.length > 5) {
				console.error(
					"Error occurred adding stock, symbol length must be between 1 and 5 characters",
				);
				response.status(400);
				response.send(
					generateApiMessage(
						"Stock symbol must be between 1 and 5 characters",
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
				console.error(CONSTANTS.DELETE_STOCK_ALREADY_EXISTS);
				response.status(400);
				response.send(
					generateApiMessage(
						CONSTANTS.DELETE_STOCK_ALREADY_EXISTS,
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
	 * Deletes a stock via the supplied body that is converted into a Stock type, if it's malformed then an error occurs and is caught to avoid exceptions.
	 *
	 * @param request - The server request
	 * @param response - The server response
	 */
	public deleteStock = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const { symbol } = request.query;
			if (symbol === undefined) {
				throw new Error("Stock not supplied in query");
			}
			if ((symbol as string).length > 5) {
				console.error(
					"Error occurred deleting stock, symbol length must be between 1 and 5 characters",
				);
				response.status(400);
				response.send(
					generateApiMessage(
						"Stock symbol must be between 1 and 5 characters",
						false,
						ERROR_CODE_ENUM.DELETE_STOCK_VALIDATION_FAILURE_SYMBOL,
					),
				);
			} else if (
				(await this.stockService.getStockBySymbol(
					this.client,
					symbol as string,
				)) === null
			) {
				console.error("Stock with stock symbol doesn't exists");
				response.status(400);
				response.send(
					generateApiMessage(
						CONSTANTS.DELETE_STOCK_ALREADY_EXISTS,
						false,
						ERROR_CODE_ENUM.DELETE_STOCK_STOCK_DOESNT_EXIST,
					),
				);
			} else {
				await this.stockService.deleteStock(
					this.client,
					symbol as string,
				);
				response.status(204);
				response.send(JSON.stringify({}));
			}
		} catch (error: unknown) {
			console.error(
				`Error occurred deleting stock ${(error as Error).stack}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to delete stock",
					false,
					ERROR_CODE_ENUM.DELETE_STOCK_FAILURE,
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
		delete: [
			[
				"delete",
				this.deleteStock,
				[rolesValidator(Roles.ADMIN, this.client)],
			],
		],
		get: [
			[
				"get/id",
				this.getStockById,
				[rolesValidator(Roles.USER, this.client)],
			],
			[
				"get/symbol",
				this.getStockBySymbol,
				[rolesValidator(Roles.USER, this.client)],
			],
			[
				"get/price",
				this.getAllStocksByPrice,
				[rolesValidator(Roles.USER, this.client)],
			],
			["get/all", this.getAllStocks],
			[
				"dashboard",
				this.getStockDashboardStocks,
				[rolesValidator(Roles.USER, this.client)],
			],
		],
		post: [
			["add", this.addStock, [rolesValidator(Roles.ADMIN, this.client)]],
		],
	});

	/**
	 * Adds all routes in the route mapping to the router instance, instead of putting this logic in app.ts, put the logic in the controller
	 *
	 * @param _router - The router instance from app.ts
	 */
	public addRoutes = (_router: Router) => {
		updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
	};
}
