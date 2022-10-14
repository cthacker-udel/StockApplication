import type { Request, Response, Router } from "express";
import type { RouteMapping, User } from "../../@types";
import { generateApiMessage, generateEmail } from "../../common";
import type { StockMongoClient } from "../../mongo";
import {
	type BaseController,
	updateRoutes,
} from "../../common/api/basecontroller";
import { UserService } from "./user.service";
import type { MailService } from "@sendgrid/mail";
import { generateToken } from "../encryption/encryption";

export class UserController implements BaseController {
	public ROUTE_PREFIX = "/user/";

	private readonly userService: UserService;

	private readonly client: StockMongoClient;

	private readonly sendgridClient: MailService;

	public constructor(client: StockMongoClient, sendgridClient: MailService) {
		this.userService = new UserService();
		this.client = client;
		this.sendgridClient = sendgridClient;
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

	public changePassword = async (request: Request, response: Response) => {
		try {
			const { username } = request.body as Partial<User>;
			if (username === undefined) {
				response.status(400);
				response.send(
					generateApiMessage(
						"Failed to change password, username not sent",
					),
				);
			} else {
				const { email } =
					await this.userService.findUserEmailByUsername(
						this.client,
						username,
					);
				if (email === undefined) {
					response.status(400);
					response.send(
						generateApiMessage(
							"Failed to add token, no user found with username",
						),
					);
				} else {
					response.status(200);
					const token = generateToken();
					await this.userService.addToken(
						this.client,
						username,
						token,
					);
					console.log("sending email to", email);
					await this.sendgridClient.send(
						generateEmail(email, {
							subject: "Change Password Link",
							templateArgs: { token },
							templateId: "forgotPassword",
							title: "Change Password",
						}),
					);
					response.send({ token, username });
				}
			}
		} catch (error: unknown) {
			console.error(
				`Failed to change password,  ${(error as Error).message}`,
			);
			response.status(400);
			response.send(generateApiMessage("Failed to change password"));
		}
	};

	public getRouteMapping = (): RouteMapping => ({
		get: [],
		post: [
			["signup", this.signUp],
			["login", this.login],
			["change/password", this.changePassword],
		],
	});

	public addRoutes = (_router: Router) => {
		updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
	};
}
