/* eslint-disable no-undef -- process is defined, it's server-side code */
import { MailService } from "@sendgrid/mail";
import express from "express";
import { AppController } from "./controller";
import { StockMongoClient } from "./mongo";
import { SECRETS } from "./secrets";
import { type RedisClientType, createClient } from "redis";
import cookieParser from "cookie-parser";

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

	public redisClient: RedisClientType;

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
		this.app.use(cookieParser());
		this.client = new StockMongoClient();
		this.sendgridMailClient = new MailService();
		this.sendgridMailClient.setApiKey(SECRETS.SENDGRID);
		this.redisClient = createClient({
			url: `${SECRETS.REDIS_BASE_URL}${SECRETS.REDIS_USERNAME}:${SECRETS.REDIS_PASSWORD}@${SECRETS.REDIS_URI}:${SECRETS.REDIS_PORT}`,
		});
		this.redisClient
			.connect()
			.then((_) => {
				console.log("Redis Connected!");
			})
			.catch((_) => {
				console.log("Redis failed to connect!");
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
				this.redisClient,
			).getRouter(),
		);
	};
}

new Application().start();
