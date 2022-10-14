import type { MailDataRequired } from "@sendgrid/mail";
import type { EmailPayload } from "server/@types/api/email/EmailPayload";
import { EMAIL_CONSTANTS } from "./emailConstants";

export const generateEmail = (
	to: string,
	payload: EmailPayload,
): MailDataRequired => {
	const { templateId, templateArgs } = payload;
	return {
		dynamicTemplateData: { ...templateArgs },
		from: EMAIL_CONSTANTS.from,
		templateId,
		to,
	};
};
