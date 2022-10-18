import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';

@Injectable()
export class ConfigService {
  configUrl = 'api/';

  constructor(private http: HttpClient) {}

  getConfig<T>(endpoint: string) {
    return this.http
      .get<T>(`${this.configUrl}${endpoint}`)
      .pipe(retry(3), catchError(this.handleError));
  }

  getConfigResponse<T>(endpoint: string) {
    return this.http.get<T>(`${this.configUrl}${endpoint}`, {
      observe: 'body',
      responseType: 'json',
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
