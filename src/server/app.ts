/* eslint-disable no-undef -- process is defined, it's server-side code */
import express from "express";
import { AppController } from "./controller";
import { StockMongoClient } from "./mongo";

/**
 * The main application class, handles the setup of the express server, and the startup of the express server
 */
class Application {
	public app: express.Application;
	public port: number;
	public client: StockMongoClient;

	constructor() {
		this.app = express();
		this.port =
			process.env?.serverPort === undefined
				? 3000
				: Number(process.env.serverPort);
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(express.json());
		this.client = new StockMongoClient();
	}

	public start(): void {
		this.addController();
		this.app.listen(this.port, () => {
			console.log(`Server listening on port ${this.port} !`);
		});
	}

	public addController = (): void => {
		this.app.use("/api", new AppController(this.client).getRouter());
	};
}

new Application().start();
