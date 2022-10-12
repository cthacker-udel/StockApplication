import express from "express";
import { StockController } from "./modules/stock/stock.controller";
import type { StockMongoClient } from "./mongo";

export class AppController {
	private readonly router: express.Router = express.Router();
	private readonly stockController: StockController;

	public constructor(client: StockMongoClient) {
		this.stockController = new StockController(client);
		this.stockController.addRoutes(this.router);
	}
}
