import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/config/config.service';
import { LeaderboardUser } from 'src/app/_models/LeaderboardUser';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { User } from 'src/app/_models/User';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { StockAppSocketService } from 'src/app/_services/stockappsocket.service';
import { SECRETS } from 'src/secrets/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

type InitialStockResponse = { stocks: Stock[] };
@Component({
  selector: 'stock-dashboard',
  templateUrl: './stockdashboard.component.html',
  styleUrls: ['./stockdashboard.component.css'],
})
export class StockDashboardComponent implements OnInit {
  constructor(
    public configService: ConfigService,
    private toastr: ToastrService,
    public dashboardService: DashboardService,
    public stockAppSocketService: StockAppSocketService
  ) {}

  stocks: Stock[] = [];
  username: string = '';
  leaderboardUsers: LeaderboardUser[];

  ngOnInit(): void {
    const query = new URL(window.location.href);
    const isFirstTime = query.searchParams.get('firstTime');
    if (isFirstTime === 'true') {
      this.toastr.success('Welcome to the stock application!', 'Welcome!');
      history.replaceState(undefined, '', 'stock-dashboard');
    }
    const username = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (username) {
      this.username = (JSON.parse(username) as SessionCookie).value;
    }

    const leaderboardRequest = this.configService.getConfig<LeaderboardUser[]>(
      `${ROUTE_PREFIXES.trade}leaderboard`
    );

    leaderboardRequest.subscribe(
      (fetchedLeaderboardUsers: LeaderboardUser[]) => {
        if (fetchedLeaderboardUsers) {
          this.leaderboardUsers = fetchedLeaderboardUsers;
        }
      }
    );

    this.dashboardService
      .getInitialMarketStatus()
      .subscribe((value: Stock[]) => {
        const { stocks } = value as unknown as InitialStockResponse;
        this.stocks = stocks;
        const stockObservable = this.dashboardService.getUpdates();
        stockObservable.subscribe((latestStock: Stock) => {
          const index = this.stocks.findIndex(
            (eachStock) => eachStock.symbol === latestStock.symbol
          );
          this.stocks = [...this.stocks].map((_, i) =>
            i === index ? latestStock : _
          );
        });
      });

    this.stockAppSocketService
      .getLeaderboardUpdated()
      .subscribe((result: boolean) => {
        if (result) {
          leaderboardRequest.subscribe(
            (fetchedLeaderboardUsers: LeaderboardUser[]) => {
              if (fetchedLeaderboardUsers) {
                this.leaderboardUsers = fetchedLeaderboardUsers;
              }
            }
          );
        }
      });
  }
}
