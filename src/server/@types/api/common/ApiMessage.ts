import type { ErrorCode } from "./ErrorCode";

export type ApiMessage = {
	message: string;
	errorCode: ErrorCode;
	success: boolean;
};
