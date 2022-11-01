import type { Request, Response, Router } from "express";
import type { ChangeCredentialPayload, RouteMapping, User } from "../../@types";
import {
	EMAIL_CONSTANTS,
	EMAIL_TEMPLATES,
	generateApiMessage,
	generateEmail,
	Roles,
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
import { rolesValidator } from "../../middleware/rolesValidator/rolesValidator";
import { asyncMiddlewareHandler } from "../../middleware/asyncMiddlewareHandler";
import { cookieValidator } from "../../middleware/cookieValidator/cookieValidator";

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
				const { username, password } = loginInformation;
				const doesSessionExist =
					await this.sessionService.validateSession(
						username,
						request,
						response,
					);
				if (doesSessionExist) {
					response.status(200);
					response.header({
						"Access-Control-Expose-Headers": "474StockAppSessionId",
					});
					response.send(
						generateApiMessage("Successful login!", true),
					);
				} else {
					const canLogin = await this.userService.login(this.client, {
						password,
						username,
					});
					if (canLogin) {
						await this.sessionService.addSession(
							username,
							response,
						);
						response.status(200);
						response.send(
							generateApiMessage("Successful login!", true),
						);
					} else {
						response.status(400);
						response.send(generateApiMessage("Failed to login"));
					}
				}
			}
		} catch (error: unknown) {
			response.status(400);
			response.send(
				generateApiMessage(`Failed to login ${(error as Error).stack}`),
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

	public doesUserWithUsernameExist = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const { username } = request.query;
			if (username === undefined) {
				response.status(400);
				response.send(
					generateApiMessage("Failed to fetch user by username"),
				);
			} else {
				const result = await this.userService.doesUserWithUsernameExist(
					this.client,
					username as string,
				);
				response.status(200);
				response.send({ result });
			}
		} catch (error: unknown) {
			console.error(
				`Failed to validate user by username ${
					(error as Error).message
				}`,
			);
			response.status(400);
			response.send(
				generateApiMessage("Failed to validate user by username"),
			);
		}
	};

	public getUserDataWithUsername = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const { username } = request.query;
			if (username === undefined) {
				response.status(400);
				response.send(
					generateApiMessage("Failed to fetch user by username"),
				);
			} else {
				const result = await this.userService.getUserDataWithUsername(
					this.client,
					username as string,
				);
				if (result === undefined) {
					response.status(400);
					response.send("Invalid username sent");
				}
				response.send({ user: result });
			}
		} catch (error: unknown) {
			console.error(`Unable to find user data ${(error as Error).stack}`);
			response.status(400);
			response.send(
				generateApiMessage("Unable to find user data by username"),
			);
		}
	};

	public getUserAggregateDataWithUsername = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const { username } = request.query;
			if (username === undefined) {
				response.status(400);
				response.send(
					generateApiMessage(
						"Failed fetching user aggregate data, must send username in query string",
					),
				);
			} else {
				const result =
					await this.userService.getUserAggregateDataWithUsername(
						this.client,
						username as string,
					);
				if (result === undefined) {
					response.status(400);
					response.send(
						generateApiMessage(
							"Failed fetching user aggregate data, no response from the backend",
						),
					);
				}
				response.status(200);
				response.send(result);
			}
		} catch (error: unknown) {
			console.error(
				`Failed fetching user aggregate data ${(error as Error).stack}`,
			);
			response.status(400);
			response.send(
				generateApiMessage("Failed fetching user aggregate data"),
			);
		}
	};

	public getUserPotentialProfitWithUsername = async (
		request: Request,
		response: Response,
	) => {
		try {
			const { username } = request.query;
			if (username === undefined) {
				response.status(400);
				response.send(
					generateApiMessage(
						"Unable to find potential profit from user, username must be supplied in query",
					),
				);
			} else {
				const result = await this.userService.getUserPotentialProfit(
					this.client,
					username as string,
				);
				if (result === undefined) {
					response.status(400);
					response.send(
						generateApiMessage(
							"Unable to find user's potential profit, value returned was undefined",
						),
					);
				} else {
					response.status(200);
					response.send(result);
				}
			}
		} catch (error: unknown) {
			console.error(
				`Unable to find user's potential profit ${
					(error as Error).stack
				}`,
			);
			response.status(401);
			response.send("Unable to find user's potential profit");
		}
	};

	/**
	 * Fetches all the routes and their methods
	 *
	 * @returns The routes all mapped to their proper get numbers
	 */
	public getRouteMapping = (): RouteMapping => ({
		get: [
			["exist/username", this.doesUserWithUsernameExist],
			[
				"data",
				this.getUserDataWithUsername,
				[rolesValidator(Roles.USER, this.client)],
			],
			[
				"aggregate",
				this.getUserAggregateDataWithUsername,
				[rolesValidator(Roles.USER, this.client)],
			],
			[
				"potentialProfit",
				this.getUserPotentialProfitWithUsername,
				[rolesValidator(Roles.USER, this.client)],
			],
		],
		post: [
			["signup", this.signUp],
			["login", this.login],
			[
				"forgot/password",
				this.changePasswordRequest,
				[
					rolesValidator(Roles.USER, this.client),
					asyncMiddlewareHandler(
						cookieValidator,
						this.sessionService,
					),
				],
			],
			[
				"change/password",
				this.changePassword,
				[
					rolesValidator(Roles.USER, this.client),
					asyncMiddlewareHandler(
						cookieValidator,
						this.sessionService,
					),
				],
			],
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
