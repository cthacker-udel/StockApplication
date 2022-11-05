import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SECRETS } from 'src/secrets/secrets';
import { SessionCookie } from '../_models/SessionCookie';

@Injectable()
export class SessionService {
  addSessionInformation = (requestHeaders: HttpHeaders) => {
    const sessionInfo = requestHeaders.get(SECRETS.STOCK_APP_SESSION_COOKIE_ID);
    const sessionUsername = requestHeaders.get(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (sessionInfo !== null) {
      const parsedSessionInfo = JSON.parse(sessionInfo) as SessionCookie;
      localStorage.setItem(SECRETS.STOCK_APP_SESSION_COOKIE_ID, JSON.stringify({...parsedSessionInfo, expiration: new Date(parsedSessionInfo.expiration).getTime()}));
    }
    if (sessionUsername !== null) {
      const parsedSessionUsername = JSON.parse(sessionUsername) as SessionCookie;
      localStorage.setItem(
        SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
        JSON.stringify({...parsedSessionUsername, expiration: new Date(parsedSessionUsername.expiration).getTime()})
      );
    }
  };

  clearSessionInformation = () => {
    localStorage.removeItem(SECRETS.STOCK_APP_SESSION_COOKIE_ID);
    localStorage.removeItem(SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID);
  };

  getSession = (): string | undefined => {
    return (
      localStorage.getItem(SECRETS.STOCK_APP_SESSION_COOKIE_ID) ?? undefined
    );
  };

  getSessionUsername = (): string | undefined => {
    return (
      localStorage.getItem(SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID) ??
      undefined
    );
  };

  updateSessionInfo = (): boolean => {
    try {
      const sessionInfo = localStorage.getItem(
        SECRETS.STOCK_APP_SESSION_COOKIE_ID
      );
      const sessionUsername = localStorage.getItem(
        SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
      );
      if (sessionInfo) {
        const parsedSessionInfo = JSON.parse(sessionInfo) as SessionCookie;
        if (
          new Date(parsedSessionInfo.expiration).getTime() - Date.now() <
          3000
        ) {
          localStorage.setItem(
            SECRETS.STOCK_APP_SESSION_COOKIE_ID,
            JSON.stringify({
              ...parsedSessionInfo,
              expiration:
                parsedSessionInfo.expiration +
                SECRETS.STOCK_APP_SESSION_COOKIE_EXPIRATION,
            })
          );
        }
      }
      if (sessionUsername) {
        const parsedSessionUsernameInfo = JSON.parse(
          sessionUsername
        ) as SessionCookie;
        if (
          new Date(parsedSessionUsernameInfo.expiration).getTime() -
            Date.now() <
          3000
        ) {
          localStorage.setItem(
            SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
            JSON.stringify({
              ...parsedSessionUsernameInfo,
              expiration:
                parsedSessionUsernameInfo.expiration +
                SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_EXPIRATION,
            })
          );
        }
      }
      return true;
    } catch (error: unknown) {
      console.error(
        `Error while updating session information ${(error as Error).message}`
      );
      return false;
    }
  };

  public validateSession = (): boolean => {
    // validates solely off of expiration
    const sessionInfo = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_ID
    );
    if (sessionInfo !== null) {
      const validateSession = JSON.parse(sessionInfo) as SessionCookie;
      if (Date.now() - new Date(validateSession.expiration).getTime() > 0) {
        return false;
      }
      return true;
    }
    return false;
  };
}
