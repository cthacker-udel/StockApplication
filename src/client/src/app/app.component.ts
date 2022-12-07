import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SECRETS } from 'src/secrets';
import { SessionService } from './_services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private router: Router,
    sessionService: SessionService,
    toastrService: ToastrService
  ) {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const isSessionValid = sessionService.validateSession();
        if (
          !isSessionValid &&
          (localStorage.getItem(SECRETS.STOCK_APP_SESSION_COOKIE_ID) !== null ||
            localStorage.getItem(
              SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
            ) !== null)
        ) {
          router.navigateByUrl('/login');
          if (
            localStorage.length > 0 &&
            (localStorage.getItem(SECRETS.STOCK_APP_SESSION_COOKIE_ID) !==
              null ||
              localStorage.getItem(
                SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
              ) !== null)
          ) {
            toastrService.error('Session Expired');
            localStorage.clear();
          }
        }
      }
    });
  }
}
