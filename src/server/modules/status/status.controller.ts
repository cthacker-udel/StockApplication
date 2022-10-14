import type { Request, Response, Router } from "express";
import type { RouteMapping } from "../../@types";
import {
	type BaseController,
	ERROR_CODE_ENUM,
	generateApiMessage,
} from "../../common";
import { updateRoutes } from "../../common/api/basecontroller";
import type { StockMongoClient } from "../../mongo";
import { StatusService } from "./status.service";

export class StatusController implements BaseController {
	public ROUTE_PREFIX = "/status/";

	private readonly statusService: StatusService;

	private readonly client: StockMongoClient;

	public constructor(client: StockMongoClient) {
		this.statusService = new StatusService();
		this.client = client;
	}

	/**
	 * Gets the status of the database connections within the application
	 *
	 * @param request - The client request
	 * @param response - The server response
	 */
	public getStatus = (request: Request, response: Response): void => {
		try {
			const status = this.statusService.getStatus(this.client);
			response.status(200);
			response.send(status);
		} catch (error: unknown) {
			console.error(`Failed to get status ${(error as Error).message}`);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to get status",
					false,
					ERROR_CODE_ENUM.GENERIC_ERROR,
				),
			);
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
