/* eslint-disable no-unused-vars -- disabled for enums */
import type { ErrorCode } from "../../@types";

/**
 * The enum values of each error code
 */
export enum ERROR_CODE_ENUM {
	GENERIC_ERROR = 0,
	FIND_STOCK_FAILURE = 1,
	CREATE_STOCK_FAILURE = 2,
	CREATE_STOCK_VALIDATION_FAILURE_SYMBOL = 3,
	CREATE_STOCK_STOCK_ALREADY_EXISTS = 4,
	FIND_STOCK_BY_PRICE_FAILURE = 5,
	FIND_ALL_STOCKS_FAILURE = 6,
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
	"3": {
		code: ERROR_CODE_ENUM.CREATE_STOCK_VALIDATION_FAILURE_SYMBOL,
		message: "Symbol must be at most 3 characters",
	},
	"4": {
		code: ERROR_CODE_ENUM.CREATE_STOCK_STOCK_ALREADY_EXISTS,
		message: "Stock with symbol supplied already exists",
	},
	"5": {
		code: ERROR_CODE_ENUM.FIND_STOCK_BY_PRICE_FAILURE,
		message: "Failed to find stock by the price",
	},
	"6": {
		code: ERROR_CODE_ENUM.FIND_ALL_STOCKS_FAILURE,
		message: "Failed to find all stocks",
	},
};
