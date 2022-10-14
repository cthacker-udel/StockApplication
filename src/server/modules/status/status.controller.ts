import type { Request, Response, Router } from "express";
import type { RouteMapping } from "../../@types";
import { type BaseController } from "../../common";
import { updateRoutes } from "../../common/api/basecontroller";
import type { StockMongoClient } from "../../mongo";
import { StatusService } from "./status.service";
import type { RedisClientType } from "redis";

export class StatusController implements BaseController {
	public ROUTE_PREFIX = "/status/";

	private readonly statusService: StatusService;

	private readonly client: StockMongoClient;

	private readonly redisClient: RedisClientType;

	public constructor(client: StockMongoClient, redisClient: RedisClientType) {
		this.statusService = new StatusService();
		this.client = client;
		this.redisClient = redisClient;
	}

	/**
	 * Gets the status of the database connections within the application
	 *
	 * @param request - The client request
	 * @param response - The server response
	 */
	public getStatus = async (
		_request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const status = await this.statusService.getStatus(
				this.client,
				this.redisClient,
			);
			response.status(200);
			response.send(status);
		} catch (error: unknown) {
			console.error(`Failed to get status ${(error as Error).stack}`);
			response.status(400);
			response.send(this.statusService.getOfflineStatus());
		}
	};

	/**
	 * Gets all the routes mapped to their respective methods
	 *
	 * @returns All routes for all endpoints for all methods
	 */
	public getRouteMapping = (): RouteMapping => ({
		get: [["", this.getStatus]],
	});

	/**
	 * Adds all routes to the router instance
	 *
	 * @param _router - the router instance
	 */
	public addRoutes = (_router: Router) => {
		updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
	};
}
