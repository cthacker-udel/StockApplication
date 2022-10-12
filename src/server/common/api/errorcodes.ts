/* eslint-disable no-unused-vars -- disabled for enums */
import type { ErrorCode } from "server/@types";

/**
 * The enum values of each error code
 */
export enum ERROR_CODE_ENUM {
	GENERIC_ERROR = 0,
	FIND_STOCK_FAILURE = 1,
	CREATE_STOCK_FAILURE = 2,
}

/**
 * Uses those enum error code values to index into a dictionary/record/object that returns the error code associated with that number
 */
export const ERROR_CODES: { [key: number]: ErrorCode } = {
	"0": {
		code: ERROR_CODE_ENUM.GENERIC_ERROR,
		message: "Encountered an internal error, please try again",
	},
	"1": {
		code: ERROR_CODE_ENUM.FIND_STOCK_FAILURE,
		message: "Failed to find stock",
	},
	"2": {
		code: ERROR_CODE_ENUM.CREATE_STOCK_FAILURE,
		message: "Failed to create stock",
	},
};
