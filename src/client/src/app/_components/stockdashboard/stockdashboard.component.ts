import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/config/config.service';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { SECRETS } from 'src/secrets/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'stock-dashboard',
  templateUrl: './stockdashboard.component.html',
  styleUrls: ['./stockdashboard.component.css'],
})
export class StockDashboardComponent implements OnInit {
  constructor(
    public configService: ConfigService,
    private toastr: ToastrService
  ) {}

  stocks: Stock[] = [];
  username: string = '';

  ngOnInit(): void {
    this.toastr.success('Welcome to the stock application!', 'Welcome!');
    const configCall = this.configService.getConfig<any>(
      `${ROUTE_PREFIXES.stock}dashboard`
    );
    const username = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (username) {
      this.username = (JSON.parse(username) as SessionCookie).value;
    }
    configCall.subscribe((result: any) => {
      console.log(result);
      const { stocks } = result;
      this.stocks = stocks;
    });
  }
}
