export type ChangeCredentialPayload = {
	token: string;
	username?: string;
	email?: string;
	newPassword?: string;
	newEmail?: string;
	newUsername?: string;
};
