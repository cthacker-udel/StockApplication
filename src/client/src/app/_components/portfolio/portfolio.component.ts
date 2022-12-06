import { AfterViewInit, Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfigService } from 'src/app/config/config.service';
import { OwnedStock } from 'src/app/_models/OwnedStock';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { User } from 'src/app/_models/User';
import { StockAppSocketService } from 'src/app/_services/stockappsocket.service';
import { TradingService } from 'src/app/_services/trading.service';
import { SECRETS } from 'src/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

type UserPortfolioStock = {
  symbol: string;
  balance: number;
  change: number;
  currentPrice: number;
  gainLoss: number;
};

@Component({
  selector: 'portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent {
  userOwnedStocks: MatTableDataSource<UserPortfolioStock>;
  displayLoading: boolean;

  tableColumnDefs: any[] = [
    'Symbol',
    'Balance',
    'Change',
    'Current Price',
    'Gain/Loss',
  ];

  constructor(
    public configService: ConfigService,
    public stockAppSocketService: StockAppSocketService
  ) {
    this.displayLoading = true;
    this.userOwnedStocks = new MatTableDataSource<UserPortfolioStock>([]);
    const usernameHeader = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (usernameHeader !== null) {
      const parsedUsername = JSON.parse(usernameHeader) as SessionCookie;
      const getUserOwnedStocks = this.configService.getConfig<OwnedStock[]>(
        `${ROUTE_PREFIXES.user}ownedStocks?username=${parsedUsername.value}`
      );
      getUserOwnedStocks.subscribe((userOwnedStocks: OwnedStock[]) => {
        console.log('owned stocks = ', userOwnedStocks);
        if (this.userOwnedStocks) {
          const convertedUserStocks: UserPortfolioStock[] = [];
          const stockSymbols = userOwnedStocks.map(
            (eachOwnedStock: OwnedStock) => eachOwnedStock.symbol
          );
          // bulk fetch stocks
          const bulkFetchRequest = this.configService.getConfig<Stock[]>(
            `${ROUTE_PREFIXES.stock}get/bulk/symbol?stocks=${stockSymbols.join(
              ','
            )}`
          );
          bulkFetchRequest.subscribe((result: Stock[]) => {
            result.forEach((eachStock: Stock) => {
              const matchedStock = userOwnedStocks.find(
                (eachOwnedStock: OwnedStock) =>
                  eachOwnedStock.symbol === eachStock.symbol
              );
              console.log(matchedStock);
              if (matchedStock !== undefined) {
                console.log('pushing');
                convertedUserStocks.push({
                  balance: matchedStock.amount * eachStock.price,
                  change: (eachStock.price - eachStock.oldPrice) * 100,
                  currentPrice: eachStock.price,
                  gainLoss:
                    matchedStock.amount * eachStock.price -
                    matchedStock.amount * eachStock.oldPrice,
                  symbol: matchedStock.symbol,
                });
              }
            });
            if (convertedUserStocks.length > 0) {
              this.displayLoading = false;
              setTimeout(() => {
                this.userOwnedStocks.data = convertedUserStocks;
              }, 3000);
            }
          });
        }
      });
      this.stockAppSocketService
        .getStockUpdated()
        .subscribe((_res: Partial<Stock>) => {
          const { symbol } = _res;
          const foundUserStock = this.userOwnedStocks.data.findIndex(
            (eachOwnedStock: UserPortfolioStock) =>
              eachOwnedStock.symbol === symbol
          );
          if (foundUserStock !== -1) {
            // this.userOwnedStocks.data[foundUserStock];, put whatever logic you want in here.
          }
        });
    }
  }
}
