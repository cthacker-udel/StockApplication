import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export class RequestInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log(document);
    const cookies = document.cookie.split(';');
    if (
      cookies.includes('474StockAppSessionId') &&
      cookies.includes('474StockSessionUsername')
    ) {
      const stockAppSessionId = cookies.find((eachCookie) =>
        eachCookie.includes('474StockAppSessionId')
      );
      const stockAppSessionUsername = cookies.find((eachCookie) =>
        eachCookie.includes('474StockSessionUsername')
      );
      if (stockAppSessionId && stockAppSessionUsername) {
        const cookieHeaders = {
          '474StockAppSessionId': stockAppSessionId.split('=')[1],
          '474StockSessionUsername': stockAppSessionUsername.split('=')[1],
        };
        const requestClone = req.clone({
          setHeaders: { ...cookieHeaders, ...req.headers },
        });
        console.log('set cookie headers');
        return next.handle(requestClone);
      }
    }
    return next.handle(req);
  }
}
