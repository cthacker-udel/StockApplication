/* eslint-disable @typescript-eslint/no-unsafe-assignment -- not needed */
import type { StockMongoClient } from "../../mongo";
import {
	type BaseController,
	updateRoutes,
	generateApiMessage,
	Roles,
} from "../../common";
import type { Server } from "socket.io";
import type { Request, Response, Router } from "express";
import { SECRETS } from "../../secrets";
import type { SessionCookie, RouteMapping } from "../../@types";
import { TradeService } from "./trade.service";
import {
	rolesValidator,
	asyncMiddlewareHandler,
	cookieValidator,
} from "../../middleware";
import type { SessionService } from "../../modules";

export class TradeController implements BaseController {
	public readonly ROUTE_PREFIX: string = "/trade/";

	private readonly client: StockMongoClient;

	private readonly socketInstance: Server;

	private readonly tradeService: TradeService;

	private readonly sessionService: SessionService;

	public constructor(
		client: StockMongoClient,
		_socket: Server,
		_sessionService: SessionService,
	) {
		this.client = client;
		this.socketInstance = _socket;
		this.tradeService = new TradeService();
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
					response.status(200);
					response.send(
						generateApiMessage("Successfully bought stock", true),
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
					const result = await this.tradeService.sellStock(
						this.client,
						Number.parseInt(amt as string, 10),
						stockSymbol as string,
						username,
					);
					response.status(200);
					response.send(result);
				}
			}
		} catch (error: unknown) {
			console.error(`Error selling stock ${(error as Error).stack}`);
			response.status(400);
			response.send(generateApiMessage("Failed to sell stock", false));
		}
	};

	public getLeaderboardUsers = async (
		_request: Request,
		response: Response,
	) => {
		try {
			const topUsers = await this.tradeService.getLeaderboardUsers(
				this.client,
			);
			response.status(200);
			response.send(topUsers);
		} catch (error: unknown) {
			console.error(
				`Failed to fetch top users from the leaderboard ${
					(error as Error).stack
				}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to fetch top users from the database",
				),
			);
		}
	};

	public getRouteMapping = (): RouteMapping => ({
		get: [
			[
				"leaderboard",
				this.getLeaderboardUsers,
				[
					rolesValidator(Roles.USER, this.client),
					asyncMiddlewareHandler(
						cookieValidator,
						this.sessionService,
					),
				],
			],
		],
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
