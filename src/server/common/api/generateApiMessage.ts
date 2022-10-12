import type { ApiMessage } from "server/@types/api/common/ApiMessage";
import { ERROR_CODES } from "./errorcodes";

export const generateApiMessage = (
	message: string,
	success = true,
	code = 0,
): ApiMessage => ({
	errorCode: ERROR_CODES[code] ?? ERROR_CODES[0],
	message,
	success,
});
