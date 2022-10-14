/* eslint-disable indent -- eslint/prettier conflict */
/* eslint-disable no-mixed-spaces-and-tabs -- eslint/prettier conflict */
/* eslint-disable @typescript-eslint/indent -- eslint/prettier conflict */

import type { MailDataRequired } from "@sendgrid/mail";
import type { EmailPayload } from "server/@types/api/email/EmailPayload";
import { EMAIL_CONSTANTS } from "./emailConstants";
import { EMAIL_TEMPLATES } from "./templates/emailtemplates";

export const generateEmail = (
	to: string,
	payload: EmailPayload,
): MailDataRequired => {
	const { subject, templateId, templateArgs } = payload;
	return {
		from: EMAIL_CONSTANTS.from,
		html:
			(templateId !== undefined &&
				(typeof EMAIL_TEMPLATES[templateId] === "function"
					? (
							EMAIL_TEMPLATES[templateId] as (
								_arguments: any,
							) => string
					  )({
							...templateArgs,
					  })
					: (EMAIL_TEMPLATES[templateId] as string))) ||
			"",
		mailSettings: {
			footer: {
				enable: true,
				html: EMAIL_CONSTANTS.footerHtml,
			},
		},
		subject,
		to,
	};
};
