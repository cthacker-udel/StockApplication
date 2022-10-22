import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';

@Injectable()
export class ConfigService {
  configUrl = 'http://localhost:3000/api';

  corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
  };

  constructor(private http: HttpClient) {}

  getConfig<T>(endpoint: string) {
    return this.http
      .get<T>(`${this.configUrl}${endpoint}`, { headers: this.corsHeaders, withCredentials: true })
      .pipe(retry(3), catchError(this.handleError));
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

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Client-side error occurred ', error.error);
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
