type ForgotPasswordArguments = {
	token: string;
};

const FORGOT_PASSWORD_TEMPLATE = ({ token }: ForgotPasswordArguments) =>
	`<html><body><div style="font-size: .75em; margin-bottom: 5vh;">474 Stock Trader Application</div><div style="text-align: center; font-weight: bold;">Forgot Password Link</div><div style="margin-top: 10vh; text-align: center;"><a href="http://localhost:3000/api/forgot/password?token=${token}">Click here to change password</a></div></body></html>`;

export const EMAIL_TEMPLATES: {
	[key: string]: string | ((_arguments: any) => string);
} = {
	forgotPassword: FORGOT_PASSWORD_TEMPLATE,
};
