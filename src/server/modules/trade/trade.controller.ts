/* eslint-disable @typescript-eslint/no-unsafe-assignment -- not needed */
import type { StockMongoClient } from "../../mongo/stockMongoClient";
import type { StockService } from "../stock/stock.service";
import {
	type BaseController,
	updateRoutes,
} from "../../common/api/basecontroller";
import type { Server } from "socket.io";
import type { RouteMapping } from "@types";
import type { Request, Response, Router } from "express";
import { generateApiMessage, Roles } from "../../common";
import type { UserService } from "../../modules/user";
import { SECRETS } from "../../secrets";
import type { SessionCookie } from "../../@types/api/session/SessionCookie";
import type { TradeService } from "./trade.service";
import { rolesValidator } from "middleware/rolesValidator/rolesValidator";
import type { SessionService } from "modules/session";
import { asyncMiddlewareHandler } from "middleware/asyncMiddlewareHandler";
import { cookieValidator } from "middleware/cookieValidator/cookieValidator";

export class TradeController implements BaseController {
	public readonly ROUTE_PREFIX: string = "/trade/";

	private readonly stockService: StockService;

	private readonly userService: UserService;

	private readonly client: StockMongoClient;

	private readonly socketInstance: Server;

	private readonly tradeService: TradeService;

	private readonly sessionService: SessionService;

	public constructor(
		client: StockMongoClient,
		_socket: Server,
		_stockService: StockService,
		_userService: UserService,
		_tradeService: TradeService,
		_sessionService: SessionService,
	) {
		this.client = client;
		this.socketInstance = _socket;
		this.stockService = _stockService;
		this.userService = _userService;
		this.tradeService = _tradeService;
		this.sessionService = _sessionService;
	}

	public buyStock = async (request: Request, response: Response) => {
		try {
			if (request.body === undefined) {
				response.status(400);
				response.send(
					generateApiMessage(
						"Unable to buy stock, no body sent with request",
					),
				);
			} else {
				const { amt, stockSymbol } = request.query;
				const usernameHeader = request.header(
					SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
				);
				if (
					usernameHeader === undefined ||
					amt === undefined ||
					stockSymbol === undefined
				) {
					response.status(400);
					response.send(
						generateApiMessage(
							"Improper data sent for buy operation, failed to execute.",
						),
					);
				} else {
					const parsedUsername = JSON.parse(
						usernameHeader,
					) as SessionCookie;
					const { value: username } = parsedUsername;
					await this.tradeService.buyStock(
						this.client,
						Number.parseInt(amt as string, 10),
						stockSymbol as string,
						username,
					);
				}
			}
		} catch (error: unknown) {
			console.error(
				`Error occurred buying stock ${(error as Error).stack}`,
			);
			response.status(400);
			response.send(generateApiMessage("Failed to buy stock", false));
		}
	};

	public sellStock = async (request: Request, response: Response) => {
		try {
			if (request.body === undefined) {
				response.status(400);
				response.send(
					generateApiMessage("Failed to sell stock, no body sent"),
				);
			} else {
				const { amt, stockSymbol } = request.body;
				const usernameHeader = request.header(
					SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
				);
				if (
					usernameHeader === undefined ||
					amt === undefined ||
					stockSymbol === undefined
				) {
					response.status(400);
					response.send(
						generateApiMessage(
							"Failed to sell stock, invalid data sent.",
							false,
						),
					);
				} else {
					const parsedUsername = JSON.parse(
						usernameHeader,
					) as SessionCookie;
					const { value: username } = parsedUsername;
					await this.tradeService.sellStock(
						this.client,
						Number.parseInt(amt as string, 10),
						stockSymbol as string,
						username,
					);
				}
			}
		} catch (error: unknown) {
			console.error(`Error selling stock ${(error as Error).stack}`);
			response.status(400);
			response.send(generateApiMessage("Failed to sell stock", false));
		}
	};

	public getRouteMapping = (): RouteMapping => ({
		post: [
			[
				"buy",
				this.buyStock,
				[
					rolesValidator(Roles.USER, this.client),
					asyncMiddlewareHandler(
						cookieValidator,
						this.sessionService,
					),
				],
			],
			[
				"sell",
				this.sellStock,
				[
					rolesValidator(Roles.USER, this.client),
					asyncMiddlewareHandler(
						cookieValidator,
						this.sessionService,
					),
				],
			],
		],
	});

	public addRoutes = (_router: Router) => {
		updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
	};
}
