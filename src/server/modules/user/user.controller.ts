import type { Request, Response, Router } from "express";
import type { RouteMapping, User } from "../../@types";
import { generateApiMessage } from "../../common";
import type { StockMongoClient } from "../../mongo";
import {
	type BaseController,
	updateRoutes,
} from "../../common/api/basecontroller";
import { UserService } from "./user.service";

export class UserController implements BaseController {
	public ROUTE_PREFIX = "/user/";

	private readonly userService: UserService;

	private readonly client: StockMongoClient;

	public constructor(client: StockMongoClient) {
		this.userService = new UserService();
		this.client = client;
	}

	public signUp = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const signUpInformation = request.body as User;
			const canSignUp = await this.userService.signUp(
				this.client,
				signUpInformation,
			);
			if (canSignUp) {
				response.status(200);
				response.send(generateApiMessage("Successful sign up!", true));
			} else {
				response.status(400);
				response.send(generateApiMessage("Failed to sign up"));
			}
		} catch (error: unknown) {
			response.status(400);
			response.send(
				generateApiMessage(
					`Failed to sign user up ${(error as Error).message}`,
				),
			);
		}
	};

	public login = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const loginInformation = request.body as Partial<User>;
			if (
				loginInformation?.username !== undefined &&
				loginInformation?.password !== undefined
			) {
				const { username, password } = loginInformation;
				const canLogin = await this.userService.login(this.client, {
					password,
					username,
				});
				if (canLogin) {
					response.status(200);
					response.send(
						generateApiMessage("Successful login!", true),
					);
				} else {
					response.status(400);
					response.send(generateApiMessage("Failed to login"));
				}
			} else {
				response.status(200);
				response.send(generateApiMessage("Failed to login"));
			}
		} catch (error: unknown) {
			response.status(400);
			response.send(
				generateApiMessage(
					`Failed to login ${(error as Error).message}`,
				),
			);
		}
	};

	public getRouteMapping = (): RouteMapping => ({
		get: [],
		post: [
			["signup", this.signUp],
			["login", this.login],
		],
	});

	public addRoutes = (_router: Router) => {
		updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
	};
}
