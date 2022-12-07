/* eslint-disable @typescript-eslint/indent -- disabled */
import type { Request, Response, Router } from "express";
import type { ChangeCredentialPayload, RouteMapping, User } from "../../@types";
import {
	EMAIL_CONSTANTS,
	EMAIL_TEMPLATES,
	generateApiMessage,
	generateEmail,
	Roles,
	type BaseController,
	updateRoutes,
} from "../../common";
import { type StockMongoClient, MONGO_COMMON } from "../../mongo";
import { UserService } from "./user.service";
import type { MailService } from "@sendgrid/mail";
import { generateToken } from "../encryption";
import type { SessionService } from "../session";
import {
	rolesValidator,
	cookieValidator,
	asyncMiddlewareHandler,
} from "../../middleware";
import type { Server } from "socket.io";
import type {
	ChangeStreamDeleteDocument,
	ChangeStreamDocument,
	ChangeStreamDocumentCommon,
	ChangeStreamDocumentKey,
	ChangeStreamInsertDocument,
	ChangeStreamUpdateDocument,
} from "mongodb";
import { sanitizeUserInfo } from "../../modules";

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
		_socket: Server,
	) {
		this.userService = new UserService();
		this.client = client;
		this.sendgridClient = sendgridClient;
		this.sessionService = _sessionService;

		this.client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("user")
			.watch()
			.on(
				"change",
				(
					changedDocument: ChangeStreamDocument<User> &
						ChangeStreamDocumentCommon &
						ChangeStreamDocumentKey<User> &
						(
							| ChangeStreamDeleteDocument
							| ChangeStreamInsertDocument
							| ChangeStreamUpdateDocument
						),
				): void => {
					const { documentKey, operationType } = changedDocument;
					if (documentKey !== undefined) {
						const { _id } = documentKey;
						this.userService
							.getUsernameFromObjectId(this.client, _id)
							.then((user: User | undefined) => {
								if (
									operationType === "update" &&
									user !== undefined
								) {
									const { updateDescription } =
										changedDocument;
									const sanitizedUser =
										sanitizeUserInfo(user);
									if (
										updateDescription.updatedFields
											?.portfolio
									) {
										this.userService
											.compareToLeaderboardUsers(
												this.client,
												sanitizedUser,
											)
											.then((result: boolean) => {
												if (result) {
													_socket.emit(
														"leaderboardUpdated",
														result,
													);
												}
											})
											.catch((error: unknown) => {
												console.error(
													`Failed to emit leaderboard updated event ${
														(error as Error).stack
													}`,
												);
											});
									}
									_socket.emit("userUpdated", {
										...sanitizedUser,
										...updateDescription.updatedFields,
									});
								}
							})
							.catch((error: unknown) => {
								console.error(
									`Failed in onchange user trigger ${
										(error as Error).stack
									}`,
								);
							});
					}
				},
			);
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
					const { canLogin, token } = await this.userService.login(
						this.client,
						{
							password,
							username,
						},
					);
					if (canLogin) {
						await this.sessionService.addSession(
							username,
							response,
							token,
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

	/**
	 * Checks whether the username supplied in the request exists
	 *
	 * @param request - The request from the client
	 * @param response - The response sent back to the callee
	 */
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

	/**
	 * Gets the user data associated with the username
	 *
	 * @param request - The request from the client-side
	 * @param response - The response sent back to the callee
	 */
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

	/**
	 * Gets the user aggregate data for the username given in the request
	 *
	 * @param request - The request coming from the client-side
	 * @param response - The response sent back to the user
	 */
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

	/**
	 * Gets the user's potential profit associated with the username passed in
	 *
	 * @param request - The request coming from the user (application)
	 * @param response - The returned response to the client
	 */
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
	 * Get all user owned stock with associated username
	 *
	 * @param request - The client-side request coming from the front-end
	 * @param response - The response sent back to the callee
	 */
	public getUserOwnedStocksWithUsername = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const { username } = request.query;
			if (username === undefined) {
				response.status(400);
				response.send(
					generateApiMessage(
						"Failed to fetch user owned stock, no username supplied",
					),
				);
			} else {
				const result =
					await this.userService.getUserOwnedStockWithUsername(
						this.client,
						username as string,
					);
				if (result.length === 0) {
					response.status(204);
				} else {
					response.status(200);
					response.send(result);
				}
			}
		} catch (error: unknown) {
			console.error(
				`Failed to fetch user owned stocks ${(error as Error).stack}`,
			);
			response.status(400);
			response.send(
				generateApiMessage(
					"Failed to fetch user owned stocks via username",
				),
			);
		}
	};

	public validateToken = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			if (request.body === undefined) {
				throw new Error(
					"Must supply body with token and username to validate token endpoint",
				);
			}
			const { token, username } = request.body as unknown as {
				token?: string;
				username?: string;
			};
			if (username === undefined) {
				console.error(
					"Username must be supplied to validate token method",
				);
				response.status(400);
				response.send(
					generateApiMessage(
						"Failed to validate token with no username supplied, please supply username to validate token",
					),
				);
			} else if (token === undefined) {
				console.error(
					"Token must be supplied to validate the session token",
				);
				response.status(400);
				response.send(
					generateApiMessage(
						"Failed to validate session token with no token supplied, please supply token to successfully validate the token",
					),
				);
			} else {
				const validationResult =
					await this.sessionService.validateSession(
						username as string,
						request,
						response,
					);
				if (validationResult) {
					response.status(204);
					response.send({});
				} else {
					response.status(400);
					response.send(
						generateApiMessage(
							"Token supplied to validation session is incorrect, causing session to be invalid",
						),
					);
				}
			}
		} catch (error: unknown) {
			console.error(
				`Failed validating user token ${(error as Error).stack}`,
			);
			response.status(400);
			response.send(generateApiMessage("Failed to validate user token"));
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
			[
				"ownedStocks",
				this.getUserOwnedStocksWithUsername,
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
			[
				"validatetoken",
				this.validateToken,
				[rolesValidator(Roles.USER, this.client)],
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
