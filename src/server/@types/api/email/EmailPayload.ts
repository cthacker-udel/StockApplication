export type EmailPayload = {
	body?: string;
	templateArgs?: { [key: string]: unknown };
	subject?: string;
	title?: string;
	templateId?: string;
};
