/* eslint-disable no-unused-vars -- disabled for enums */
import type { ErrorCode } from "src/server/@types";

export enum ERROR_CODE_ENUM {
	GENERIC_ERROR = 0,
	FIND_STOCK_FAILURE = 1,
}

export const ERROR_CODES: { [key: number]: ErrorCode } = {
	"0": {
		code: ERROR_CODE_ENUM.GENERIC_ERROR,
		message: "Encountered an internal error, please try again",
	},
	"1": {
		code: ERROR_CODE_ENUM.FIND_STOCK_FAILURE,
		message: "Failed to find stock",
	},
};