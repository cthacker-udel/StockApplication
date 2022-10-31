import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/config/config.service';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { User } from 'src/app/_models/User';
import { SECRETS } from 'src/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'sidebar',
  styleUrls: ['./sidebar.component.css'],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  isSidebarExpanded: boolean = true;
  currentUser: Partial<User>;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    const storedUsername = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (storedUsername !== null) {
      // found user, grab information
      const parsedUsername = JSON.parse(storedUsername) as SessionCookie;
      const request = this.configService.getConfig<User>(
        `${ROUTE_PREFIXES.user}data?username=${parsedUsername.value}`
      );
      request.subscribe((result: Partial<User>) => {
        console.log('found user = ', result);
        this.currentUser = result;
      });
    }
  }

  get sidebarExpanded() {
    return this.isSidebarExpanded;
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }
}
