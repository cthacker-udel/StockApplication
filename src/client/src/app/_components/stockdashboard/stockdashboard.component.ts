import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/config/config.service';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { DashboardService } from 'src/app/_services/dashboard.service';
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
    public dashboardService: DashboardService
  ) {}

  stocks: Stock[] = [];
  username: string = '';

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
  }
}
