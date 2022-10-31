import type { MailService } from "@sendgrid/mail";
import express, { type Router } from "express";
import { StockController } from "./modules";
import { StatusController } from "./modules/status";
import { UserController } from "./modules/user";

import type { StockMongoClient } from "./mongo";
import { SessionService } from "./modules/session/session.service";
import type { Server } from "socket.io";
import { TradingService } from "modules/trading/trading.service";

export class AppController {
	/**
	 * The router instance
	 */
	private readonly router: express.Router = express.Router();
	/**
	 * The stock controller instance
	 */
	private readonly stockController: StockController;
	/**
	 * The user controller instance
	 */
	private readonly userController: UserController;
	/**
	 * The status controller instance
	 */
	private readonly statusController: StatusController;
	/**
	 * The session service instance
	 */
	private readonly sessionService: SessionService;

	/**
	 * The socket instance
	 */
	private readonly socketServer: Server;

	/**
	 * The service to handle trading logic
	 */
	private readonly tradingService: TradingService;

	/**
	 * Constructs a AppController instance, instantiating it's stockController and it's router instance
	 *
	 * @param client - the stock mongo client instance passed from app.ts
	 */
	public constructor(
		client: StockMongoClient,
		_mailClient: MailService,
		_socket: Server,
	) {
		this.socketServer = _socket;
		this.sessionService = new SessionService(client);
		this.tradingService = new TradingService(client);

		this.stockController = new StockController(
			client,
			this.sessionService,
			this.socketServer,
			this.tradingService,
		);
		this.userController = new UserController(
			client,
			_mailClient,
			this.sessionService,
		);
		this.statusController = new StatusController(client);

		this.stockController.addRoutes(this.router);
		this.userController.addRoutes(this.router);
		this.statusController.addRoutes(this.router);
	}

	/**
	 * Gets and returns the internal router instance
	 *
	 * @returns - The internal router instance
	 */
	public getRouter = (): Router => this.router;
}
