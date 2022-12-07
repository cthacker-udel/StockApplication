import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/config/config.service';
import { OwnedStock } from 'src/app/_models/OwnedStock';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { User } from 'src/app/_models/User';
import { UserAggregateData } from 'src/app/_models/UserAggregateData';
import { StockAppSocketService } from 'src/app/_services/stockappsocket.service';
import { UserService } from 'src/app/_services/user.service';
import { SECRETS } from 'src/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { dateToMMDDYYYY } from 'src/shared/helpers/dateToMMDDYYYY';

@Component({
  selector: 'sidebar',
  styleUrls: ['./sidebar.component.css'],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  isSidebarExpanded: boolean = false;
  touched: boolean = false;
  currentUser: Partial<User>;
  currentUserStockSymbols: string[];
  userAggregateData: UserAggregateData;

  constructor(
    private configService: ConfigService,
    private stockAppSocketService: StockAppSocketService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUser.subscribe((value: { user: Partial<User> }) => {
      if (value && Object.keys(value?.user).length > 0) {
        const { user } = value;
        this.currentUser = user;
      }
    });
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
        this.currentUser = result.user;
        if (result.user.portfolio) {
          this.currentUserStockSymbols = result.user.portfolio.stocks.map(
            (eachStock: OwnedStock) => eachStock.symbol
          );
        }
      });
      const aggregateRequest = this.configService.getConfig<UserAggregateData>(
        `${ROUTE_PREFIXES.user}aggregate?username=${parsedUsername.value}`
      );
      aggregateRequest.subscribe((result: UserAggregateData) => {
        this.userAggregateData = result;
      });

      const potentialProfitRequest = this.configService.getConfig<
        Partial<UserAggregateData>
      >(
        `${ROUTE_PREFIXES.user}potentialProfit?username=${parsedUsername.value}`
      );

      this.stockAppSocketService
        .getStockUpdated()
        .subscribe((changedStock: Stock) => {
          if (
            this.currentUserStockSymbols &&
            this.currentUserStockSymbols.includes(changedStock.symbol)
          ) {
            potentialProfitRequest.subscribe(
              (updatedPotentialProfit: Partial<UserAggregateData>) => {
                if (updatedPotentialProfit.totalPotentialProfit) {
                  this.userAggregateData.totalPotentialProfit =
                    updatedPotentialProfit.totalPotentialProfit;
                }
              }
            );
          }
        });

      this.stockAppSocketService
        .getUserUpdated()
        .subscribe((updatedUser: Partial<User>) => {
          this.currentUser = { ...this.currentUser, ...updatedUser };
          potentialProfitRequest.subscribe(
            (updatedPotentialProfit: Partial<UserAggregateData>) => {
              if (updatedPotentialProfit.totalPotentialProfit !== undefined) {
                this.userAggregateData.totalPotentialProfit =
                  updatedPotentialProfit.totalPotentialProfit;
              }
            }
          );
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

  clearFields() {
    this.currentUser = {};
    this.currentUserStockSymbols = [];
  }

  logOut() {
    localStorage.clear();
    this.clearFields();
    this.router.navigateByUrl('/');
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

  truncateDecimal(decimal: number, amount: number) {
    return decimal.toFixed(amount);
  }
}
