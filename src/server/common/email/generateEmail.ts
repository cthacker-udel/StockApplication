import type { MailDataRequired } from "@sendgrid/mail";
import { EmailPayload } from "server/@types/api/email/EmailPayload";
import { EMAIL_CONSTANTS } from "./emailConstants";
import { EMAIL_TEMPLATES } from "./templates/emailtemplates";

export const generateEmail = (
	to: string,
	payload: EmailPayload,
): MailDataRequired => {
	const { subject, templateId } = payload;
	return {
		to,
		subject,
		from: EMAIL_CONSTANTS.from,
		html: EMAIL_TEMPLATES[templateId],
	};
};
