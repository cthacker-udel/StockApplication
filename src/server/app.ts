/* eslint-disable no-undef -- process is defined, it's server-side code */
import { MailService } from "@sendgrid/mail";
import express from "express";
import { AppController } from "./controller";
import { StockMongoClient } from "./mongo";
import { SECRETS } from "./secrets";
import { SessionService } from "./modules";
import { corsInjector } from "./middleware";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { socketCorsHeaders } from "./common";

/**
 * The main application class, handles the setup of the express server, and the startup of the express server
 */
class Application {
	/**
	 * The application
	 */
	public app: express.Application;
	/**
	 * The port the application is listening on
	 */
	public port: number;
	/**
	 * The stock mongo client instance
	 */
	public client: StockMongoClient;

	public sendgridMailClient: MailService;

	private readonly sessionService: SessionService;

	private readonly httpServer;

	private readonly socket: Server;

	/**
	 * Constructs the application
	 */
	constructor() {
		this.app = express();
		this.port =
			process.env?.serverPort === undefined
				? 3000
				: Number(process.env.serverPort);
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(express.json());
		this.client = new StockMongoClient();
		this.sessionService = new SessionService(this.client);
		this.app.use(corsInjector);
		this.sendgridMailClient = new MailService();
		this.sendgridMailClient.setApiKey(SECRETS.SENDGRID);
		this.httpServer = createServer().listen(3001);
		this.socket = new Server(this.httpServer, {
			cors: socketCorsHeaders,
		});
	}

	/**
	 * Handles all startup/setup methods and starts the server at the end
	 */
	public start(): void {
		this.addController();
		this.app.listen(this.port, () => {
			console.log(`Navigate to http://localhost:${this.port} !`);
		});
	}

	/**
	 * Adds the controller to the app
	 */
	public addController = (): void => {
		this.app.use(
			"/api",
			new AppController(
				this.client,
				this.sendgridMailClient,
				this.socket,
			).getRouter(),
		);
	};
}

new Application().start();
