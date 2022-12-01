import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, throwError } from 'rxjs';
import { SessionService } from '../_services/session.service';

@Injectable()
export class ConfigService {
  configUrl = 'http://localhost:3000/api';

  corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
  };

  constructor(
    private http: HttpClient,
    private _router: Router,
    private sessionService: SessionService
  ) {}

  getConfig<T>(endpoint: string) {
    return this.http
      .get<T>(`${this.configUrl}${endpoint}`, {
        headers: this.corsHeaders,
        withCredentials: true,
      })
      .pipe(
        retry(3),
        catchError((error: HttpErrorResponse) => this.handleError(error, this))
      );
  }

  getConfigResponse<T>(endpoint: string) {
    return this.http.get<T>(`${this.configUrl}${endpoint}`, {
      observe: 'body',
      responseType: 'json',
      headers: this.corsHeaders,
      withCredentials: true,
    });
  }

  postConfig<T>(endpoint: string, body: any) {
    return this.http.post<T>(`${this.configUrl}${endpoint}`, body, {
      headers: this.corsHeaders,
      withCredentials: true,
    });
  }

  postConfigResponse<T>(endpoint: string, body: any) {
    return this.http.post<T>(`${this.configUrl}${endpoint}`, body, {
      headers: this.corsHeaders,
      withCredentials: true,
      observe: 'response',
      responseType: 'json',
    });
  }

  deleteConfig<T>(endpoint: string) {
    return this.http.delete<T>(`${this.configUrl}${endpoint}`, {
      headers: this.corsHeaders,
      withCredentials: true,
    });
  }

  handleError(error: HttpErrorResponse, context: ConfigService) {
    console.log('error = ', error);
    if (error.status === 0) {
      console.error('Client-side error occurred ', error.error);
    } else if (error.status === 401) {
      this.sessionService.clearSessionInformation();
      if (document && !document.URL.endsWith('login')) {
        context._router
          .navigate(['login'])
          .then((result) => console.log('res = ', result));
      }
    } else {
      console.error(
        `Backend returned code ${error.status}, body was : ${error.error}`
      );
    }
    return throwError(
      () => new Error('Something bad happened, please try again later.')
    );
  }
}
