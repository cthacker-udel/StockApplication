import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { SECRETS } from 'src/secrets/secrets';
import { SessionService } from '../_services/session.service';

export class RequestInterceptor implements HttpInterceptor {
  constructor(private sessionService: SessionService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.sessionService.validateSession()) {
      this.sessionService.updateSessionInfo();
    }
    const sessionCookie = this.sessionService.getSession();
    const sessionUsername = this.sessionService.getSessionUsername();
    if (sessionCookie && sessionUsername) {
      const requestClone = req.clone();
      let headers: HttpHeaders = new HttpHeaders();
      headers = requestClone.headers.append(
        SECRETS.STOCK_APP_SESSION_COOKIE_ID,
        sessionCookie
      );
      headers = headers.append(
        SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID,
        sessionUsername
      );
      const finalClone = requestClone.clone({ headers });
      return next.handle(finalClone.clone());
    }
    return next.handle(req);
  }
}
