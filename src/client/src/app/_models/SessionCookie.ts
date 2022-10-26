export type SessionCookie = {
  value: string;
  // utc date string
  expiration: string;
} & { [key: string]: any };
