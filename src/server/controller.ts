import express, { type Router } from "express";
import { StockController } from "./modules";
import { UserController } from "./modules/user";

import type { StockMongoClient } from "./mongo";

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
	 * Constructs a AppController instance, instantiating it's stockController and it's router instance
	 *
	 * @param client - the stock mongo client instance passed from app.ts
	 */
	public constructor(client: StockMongoClient) {
		this.stockController = new StockController(client);
		this.userController = new UserController(client);

		this.stockController.addRoutes(this.router);
		this.userController.addRoutes(this.router);
	}

	/**
	 * Gets and returns the internal router instance
	 *
	 * @returns - The internal router instance
	 */
	public getRouter = (): Router => this.router;
}
