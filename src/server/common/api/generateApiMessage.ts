import type { ApiMessage } from "../../@types/api/common/ApiMessage";
import { ERROR_CODES } from "./errorcodes";

/**
 * Generates an ApiMessage to return to the user upon request
 *
 * @param message - The message to add to the api response
 * @param success - Whether or not the message was successful, defaults to false
 * @param code - If the message was successful, don't bother parsing code, if not, parse code as ErrorCode, defaults to 0
 * @returns - The api message with the given parameters
 */
export const generateApiMessage = (
	message: string,
	success = false,
	code = -1,
): ApiMessage => ({
	errorCode: ERROR_CODES[code] ?? ERROR_CODES[0],
	message,
	success,
});
