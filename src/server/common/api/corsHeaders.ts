import { SECRETS } from "../../secrets";

export const corsHeaders = {
	"Access-Control-Allow-Headers": `Origin, Content-Type, X-Auth-Token, content-type, X-Requested-With, Accept, access-control-allow-credentials, ${SECRETS.STOCK_APP_SESSION_COOKIE_ID}, ${SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID}`,
	"Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, PUT, OPTIONS",
	"Access-Control-Allow-Origin": "http://localhost:4200",
	"Access-Control-Expose-Headers": `${SECRETS.STOCK_APP_SESSION_COOKIE_ID}, ${SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID}`,
};

export const socketCorsHeaders = {
	methods: ["GET"],
	origin: "http://localhost:4200",
};
