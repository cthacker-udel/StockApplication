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

type UserPortfolioStock = OwnedStock & {
  currentPrice: number;
  changePercentage: number;
  isGain: boolean;
  gainLossAmount: number;
};

@Component({
  selector: 'portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent implements AfterViewInit {
  userOwnedStocks: MatTableDataSource<UserPortfolioStock>;

  constructor(
    public configService: ConfigService,
    public stockAppSocketService: StockAppSocketService
  ) {
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
        if (this.userOwnedStocks) {
          // TODO: Add like a bulk fetch for stock symbols
          // TODO: Add bought price into owned stock
          // TODO: Add a record to owned stock consisting of the amount bought, and the price it was bought at
          // how to calculate what price we bought 15 of the 45 AMC stock is to like
          // cycle through the collection of records, and subtracting the amount until we reach the price at the amount we were looking for.
          // records: [{ amt: 15, price: 20, totalAmount: number }, { amt: 15, price 30, totalNumber: number }, { amt: 15, price: 45, totalNumber: number }];
          const convertedUserOwnedStocks: UserPortfolioStock[] = [];
          userOwnedStocks.forEach(
            (eachOwnedStock: OwnedStock, _index: number) => {
              const stockFetch = this.configService.getConfig<Stock>(
                `${ROUTE_PREFIXES.stock}get/symbol?symbol=${eachOwnedStock.symbol}`
              );
              stockFetch.subscribe((currentStock: Stock) => {
                convertedUserOwnedStocks.push({
                  ...eachOwnedStock,
                  currentPrice: currentStock.price,
                  changePercentage: 0,
                  isGain: false,
                  gainLossAmount: currentStock.price * eachOwnedStock.amount,
                });
              });
            }
          );
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

  ngAfterViewInit(): void {
    /*if (this.stocks) {
          this.stocks.paginator = this.paginator;
        } else if (this.ownedStocks) {
          this.ownedStocks.paginator = this.ownedStocksPaginator;
        }*/
  }
}
