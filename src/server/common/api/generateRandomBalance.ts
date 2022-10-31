import { randomInt } from "node:crypto";
import { API_CONSTANTS } from "./apiConstants";

export const generateRandomBalance = (): number =>
	randomInt(
		API_CONSTANTS.INITIAL_BALANCE_MIN,
		API_CONSTANTS.INITIAL_BALANCE_MAX,
	);
