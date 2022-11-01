import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/config/config.service';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { User } from 'src/app/_models/User';
import { UserAggregateData } from 'src/app/_models/UserAggregateData';
import { TradingService } from 'src/app/_services/trading.service';
import { SECRETS } from 'src/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { dateToMMDDYYYY } from 'src/shared/helpers/dateToMMDDYYYY';

@Component({
  selector: 'sidebar',
  styleUrls: ['./sidebar.component.css'],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  isSidebarExpanded: boolean = true;
  touched: boolean = true;
  currentUser: Partial<User>;
  userAggregateData: UserAggregateData;

  constructor(
    private configService: ConfigService,
    private tradingService: TradingService
  ) {}

  ngOnInit(): void {
    const storedUsername = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (storedUsername !== null) {
      // found user, grab information
      const parsedUsername = JSON.parse(storedUsername) as SessionCookie;
      const dataRequest = this.configService.getConfig<{ user: Partial<User> }>(
        `${ROUTE_PREFIXES.user}data?username=${parsedUsername.value}`
      );
      dataRequest.subscribe((result: { user: Partial<User> }) => {
        console.log('found user = ', result);
        this.currentUser = result.user;
      });
      const aggregateRequest = this.configService.getConfig<UserAggregateData>(
        `${ROUTE_PREFIXES.user}aggregate?username=${parsedUsername.value}`
      );
      aggregateRequest.subscribe((result: UserAggregateData) => {
        this.userAggregateData = result;
      });
    }
  }

  get sidebarExpanded() {
    return this.isSidebarExpanded;
  }

  toggleSidebar() {
    if (!this.touched) {
      this.touched = true;
    }
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  getToggleButtonTooltipText() {
    return this.isSidebarExpanded ? 'Shrink Toolbar' : 'Expand Toolbar';
  }

  properPluralEnding(amt: number | undefined, text: string): string {
    return amt ? (amt > 1 ? `${amt} ${text}s` : `${amt} ${text}`) : '';
  }

  properDateFormat(date: Date | string): string {
    return dateToMMDDYYYY(date);
  }
}
