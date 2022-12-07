import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, throwError } from 'rxjs';

@Injectable()
export class ConfigService {
  configUrl = 'http://localhost:3000/api';

  corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
  };

  constructor(private http: HttpClient, private router: Router) {}

  getConfig<T>(endpoint: string) {
    return this.http.get<T>(`${this.configUrl}${endpoint}`, {
      headers: this.corsHeaders,
      withCredentials: true,
    });
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

  private handleError(error: HttpErrorResponse, ctx: ConfigService) {
    console.log('error = ', error);
    if (error.status === 0) {
      ctx.router.navigateByUrl('/');
      console.error('Client-side error occurred ', error.error);
    } else {
      ctx.router.navigateByUrl('/');
      console.error(
        `Backend returned code ${error.status}, body was : ${error.error}`
      );
    }
    return throwError(() => {
      ctx.router.navigateByUrl('/');
      new Error('Something bad happened, please try again later.');
    });
  }
}
