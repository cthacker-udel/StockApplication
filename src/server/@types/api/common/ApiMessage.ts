import type { ErrorCode } from "./ErrorCode";

/**
 * Message that is returned from the server
 */
export type ApiMessage = {
	message: string;
	errorCode: ErrorCode;
	success: boolean;
};
