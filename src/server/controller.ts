import type { MailService } from "@sendgrid/mail";
import express, { type Router } from "express";
import {
	StatusController,
	UserController,
	StockController,
	SessionService,
	TradeController,
} from "./modules";

import type { StockMongoClient } from "./mongo";
import type { Server } from "socket.io";

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
	 * The trading controller instance
	 */
	private readonly tradeController: TradeController;

	/**
	 * The socket instance
	 */
	private readonly socketServer: Server;

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

		this.stockController = new StockController(
			client,
			this.sessionService,
			this.socketServer,
		);
		this.userController = new UserController(
			client,
			_mailClient,
			this.sessionService,
			this.socketServer,
		);
		this.statusController = new StatusController(client);

		this.tradeController = new TradeController(
			client,
			this.socketServer,
			this.sessionService,
		);

		this.tradeController.addRoutes(this.router);
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
