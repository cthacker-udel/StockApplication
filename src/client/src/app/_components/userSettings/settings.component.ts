import { Component } from '@angular/core';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { User } from 'src/app/_models/User';
import { SECRETS } from 'src/secrets';

@Component({
  selector: 'user-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  username: string;
  token: string;
  displayWelcomeMessage: boolean;

  constructor() {
    this.displayWelcomeMessage = true;
    const usernameHeader = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    const session = localStorage.getItem(SECRETS.STOCK_APP_SESSION_COOKIE_ID);
    if (usernameHeader != null) {
      const parsedUsername = JSON.parse(usernameHeader) as SessionCookie;
      this.username = parsedUsername.value;
    }
    if (session != null) {
      const parsedSession = JSON.parse(session) as SessionCookie;
      this.token = parsedSession.value;
    }
  }
}
