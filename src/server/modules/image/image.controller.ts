import { rolesValidator } from "../../middleware/rolesValidator/rolesValidator";
import type { RouteMapping } from "@types";
import { type BaseController, generateApiMessage, Roles } from "common";
import type { Request, Response, Router } from "express";
import type { UserService } from "modules/user";
import type { StockMongoClient } from "mongo";
import { updateRoutes } from "common/api/basecontroller";

export class ImageController implements BaseController {
	public readonly ROUTE_PREFIX = "/image/";

	private readonly userService: UserService;

	private readonly client: StockMongoClient;

	public constructor(client: StockMongoClient, _userService: UserService) {
		this.client = client;
		this.userService = _userService;
	}

	public uploadImage = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const { username } = request.query;
			if (username === undefined) {
				response.status(400);
				response.send(
					generateApiMessage("Must send username to upload image"),
				);
			} else {
				const { imageLink } = request.query;
				const addingImageLinkResult =
					await this.userService.addImageLinkToUser(
						this.client,
						username as string,
						imageLink as string,
					);
				if (addingImageLinkResult) {
					response.status(200);
					response.send(
						generateApiMessage("Added pfp image link to user"),
					);
				} else {
					response.status(400);
					response.send(
						generateApiMessage(
							"Failed to add pfp image link to user",
						),
					);
				}
			}
		} catch (error: unknown) {
			console.error(
				`Error occurred uploading image ${(error as Error).stack}`,
			);
			response.status(400);
			response.send(generateApiMessage("Error occurred uploading image"));
		}
	};

	public getRouteMapping = (): RouteMapping => ({
		post: [
			[
				"upload",
				this.uploadImage,
				[rolesValidator(Roles.USER, this.client)],
			],
		],
	});

	public addRoutes = (_router: Router) => {
		updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
	};
}
