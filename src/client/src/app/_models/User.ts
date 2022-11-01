import { Portfolio } from './Portfolio';

export type User = {
  firstName: string;
  lastName: string;
  dob: string;
  username: string;
  email: string;
  password: string;

  token: string;
  lastLogin: string;
  salt: string;
  iterations: number;
  sessionToken: string;
  roles: string[];

  balance: number;
  portfolio: Portfolio;
};
