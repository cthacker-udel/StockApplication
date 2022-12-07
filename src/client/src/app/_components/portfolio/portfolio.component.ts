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

type LivePriceReaction = {
  positive: boolean;
  negative: boolean;
  neutral: boolean;
};

type UserPortfolioStock = {
  symbol: string;
  balance: number;
  balanceReaction: LivePriceReaction;
  change: number;
  changeReaction: LivePriceReaction;
  currentPrice: number;
  currentPriceReaction: LivePriceReaction;
  gainLoss: number;
  gainLossReaction: LivePriceReaction;
};

@Component({
  selector: 'portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent {
  userOwnedStocks: MatTableDataSource<UserPortfolioStock>;
  displayLoading: boolean;
  noStocks: boolean;

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
    this.noStocks = false;
    this.displayLoading = true;
    this.userOwnedStocks = new MatTableDataSource<UserPortfolioStock>([]);
    const usernameHeader = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (usernameHeader !== null) {
      const parsedUsername = JSON.parse(usernameHeader) as SessionCookie;
      const getUserOwnedStocks = this.configService.getConfigCustomHeaders<
        OwnedStock[]
      >(`${ROUTE_PREFIXES.user}ownedStocks?username=${parsedUsername.value}`, {
        'Cache-Control': 'no-cache',
      });
      getUserOwnedStocks.subscribe((userOwnedStocks: OwnedStock[]) => {
        if (this.userOwnedStocks != null) {
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
            if (result.length === 0) {
              this.userOwnedStocks.data = [];
            }
            result.forEach((eachStock: Stock) => {
              const matchedStock = userOwnedStocks.find(
                (eachOwnedStock: OwnedStock) =>
                  eachOwnedStock.symbol === eachStock.symbol
              );
              if (matchedStock !== undefined) {
                const changeResult =
                  (eachStock.price - eachStock.oldPrice) * 100;
                const gainLoss =
                  matchedStock.amount * eachStock.price -
                  matchedStock.amount * eachStock.oldPrice;
                ('');
                convertedUserStocks.push({
                  balance: matchedStock.amount * eachStock.price,
                  balanceReaction: {
                    positive: false,
                    negative: false,
                    neutral: true,
                  },
                  change: (eachStock.price - eachStock.oldPrice) * 100,
                  changeReaction: {
                    positive: changeResult > 0,
                    negative: changeResult < 0,
                    neutral: changeResult === 0,
                  },
                  currentPrice: eachStock.price,
                  currentPriceReaction: {
                    positive: false,
                    negative: false,
                    neutral: true,
                  },
                  gainLoss:
                    matchedStock.amount * eachStock.price -
                    matchedStock.amount * eachStock.oldPrice,
                  gainLossReaction: {
                    positive: gainLoss > 0,
                    negative: gainLoss < 0,
                    neutral: gainLoss === 0,
                  },
                  symbol: matchedStock.symbol,
                });
              }
            });
            if (convertedUserStocks.length > 0) {
              this.displayLoading = false;
              setTimeout(() => {
                this.userOwnedStocks.data = convertedUserStocks;
              }, 3000);
            } else {
              setTimeout(() => {
                this.noStocks = true;
              }, 3100);
              this.displayLoading = false;
            }
          });
        }
      });
      this.stockAppSocketService
        .getStockUpdated()
        .subscribe((_res: Partial<Stock>) => {
          const { symbol, price, oldPrice } = _res;
          if (price) {
            // price changed, begin computation
            const displayedStockIndex = this.userOwnedStocks.data.findIndex(
              (eachDisplayedStock: UserPortfolioStock) =>
                eachDisplayedStock.symbol === symbol
            );
            if (displayedStockIndex !== -1) {
              const foundStock = this.userOwnedStocks.data[displayedStockIndex];
              const changeResult =
                price - (oldPrice ?? foundStock.currentPrice);
              const gainLossResult =
                foundStock.balance * foundStock.currentPrice -
                foundStock.balance * price;
              const cloneUserStockData = [...this.userOwnedStocks.data];
              const balanceDifference =
                cloneUserStockData[displayedStockIndex].balance -
                foundStock.balance * price;
              const currentPriceDifference =
                cloneUserStockData[displayedStockIndex].currentPrice - price;

              cloneUserStockData[displayedStockIndex] = {
                ...foundStock,
                balance: foundStock.balance * price,
                balanceReaction: {
                  positive: balanceDifference > 0,
                  negative: balanceDifference < 0,
                  neutral: balanceDifference === 0,
                },
                change: changeResult,
                changeReaction: {
                  positive: changeResult > 0,
                  negative: changeResult < 0,
                  neutral: changeResult === 0,
                },
                currentPrice: price,
                currentPriceReaction: {
                  positive: currentPriceDifference > 0,
                  negative: currentPriceDifference < 0,
                  neutral: currentPriceDifference === 0,
                },
                gainLoss: gainLossResult,
                gainLossReaction: {
                  positive: gainLossResult > 0,
                  negative: gainLossResult < 0,
                  neutral: gainLossResult === 0,
                },
              };
              this.userOwnedStocks.data = [...cloneUserStockData];
            }
          }
        });
    }
  }
}
