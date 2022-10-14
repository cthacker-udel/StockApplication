import type { Request, Response, Router } from "express";
import type { ChangeCredentialPayload, RouteMapping, User } from "../../@types";
import {
	EMAIL_CONSTANTS,
	EMAIL_TEMPLATES,
	generateApiMessage,
	generateEmail,
} from "../../common";
import type { StockMongoClient } from "../../mongo";
import {
	type BaseController,
	updateRoutes,
} from "../../common/api/basecontroller";
import { UserService } from "./user.service";
import type { MailService } from "@sendgrid/mail";
import { generateToken } from "../encryption/encryption";
import type { SessionService } from "../session";

export class UserController implements BaseController {
	public ROUTE_PREFIX = "/user/";

	private readonly userService: UserService;

	private readonly client: StockMongoClient;

	private readonly sendgridClient: MailService;

	private readonly sessionService: SessionService;

	public constructor(
		client: StockMongoClient,
		sendgridClient: MailService,
		_sessionService: SessionService,
	) {
		this.userService = new UserService();
		this.client = client;
		this.sendgridClient = sendgridClient;
		this.sessionService = _sessionService;
	}

	/**
	 * The controller method for handling a sign up request
	 *
	 * @param request - The client request
	 * @param response - The server response
	 */
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

	/**
	 * The controller method for handling a login request
	 *
	 * @param request - The client request
	 * @param response - The server response
	 */
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
				const { username, password, sessionToken } = loginInformation;
				const result = await this.sessionService.validateSession(
					username,
					sessionToken as string,
				);
				if (result) {
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
					response.status(400);
					response.send(generateApiMessage("Failed to login"));
				}
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

	/**
	 * The controller method for handling a change password request
	 *
	 * @param request - The client request
	 * @param response - The server response
	 */
	public changePasswordRequest = async (
		request: Request,
		response: Response,
	) => {
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
					await this.sendgridClient.send(
						generateEmail(email, {
							templateArgs: {
								buttonLink:
									EMAIL_CONSTANTS.forgotPassword.buttonLink,
								token,
							},
							templateId: EMAIL_TEMPLATES.forgotPassword,
						}),
					);
					response.send({ token, username });
				}
			}
		} catch (error: unknown) {
			console.error(
				`Failed to change password,  ${
					((error as Error).message, (error as Error).stack)
				}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to complete change password request",
				),
			);
		}
	};

	/**
	 * The controller method for handling a change password request
	 *
	 * @param request - The client request
	 * @param response - The server response
	 */
	public changePassword = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const { username, token, newPassword } =
				request.body as ChangeCredentialPayload;
			if (
				username === undefined ||
				token === undefined ||
				newPassword === undefined
			) {
				response.status(400);
				response.send(generateApiMessage("Failed to change password"));
			} else {
				await this.userService.changePassword(
					this.client,
					username,
					token,
					newPassword,
				);
				response.status(200);
				response.send(generateApiMessage("Changed password!", true));
			}
		} catch (error: unknown) {
			console.error(
				`Failed to change password ${(error as Error).message}`,
			);
			response.status(400);
			response.send(generateApiMessage("Failed to change password"));
		}
	};

	/**
	 * Fetches all the routes and their methods
	 *
	 * @returns The routes all mapped to their proper get numbers
	 */
	public getRouteMapping = (): RouteMapping => ({
		get: [],
		post: [
			["signup", this.signUp],
			["login", this.login],
			["forgot/password", this.changePasswordRequest],
			["change/password", this.changePassword],
		],
	});

	/**
	 * Adds all routes to the router passed in
	 *
	 * @param _router - the router instance
	 */
	public addRoutes = (_router: Router) => {
		updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
	};
}
