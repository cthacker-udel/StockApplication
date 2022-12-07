import { AfterViewInit, Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserAggregateData } from 'src/app/_models/UserAggregateData';
import { UserService } from 'src/app/_services/user.service';
import { ConfigService } from 'src/app/config/config.service';
import { OwnedStock } from 'src/app/_models/OwnedStock';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { User } from 'src/app/_models/User';
import { StockAppSocketService } from 'src/app/_services/stockappsocket.service';
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
  currentUser: Partial<User>;
  currentUserStockSymbols: string[];
  userAggregateData: UserAggregateData;
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
    private userService: UserService,
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
                const priceDiff = eachStock.price - eachStock.oldPrice;
                const changeResult =
                  (eachStock.price - eachStock.oldPrice) * 100;
                const gainLoss =
                 (matchedStock.amount * eachStock.price) -
                  (matchedStock.amount * eachStock.oldPrice);
                ('');
                convertedUserStocks.push({
                  balance: matchedStock.amount * eachStock.price,
                  balanceReaction: {
                    positive: false,
                    negative: false,
                    neutral: true,
                  },
                  change: Number.parseFloat(((priceDiff / eachStock.oldPrice) * 100).toFixed(2)),
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
                    Number.parseFloat(((matchedStock.amount * eachStock.price) -
                    (matchedStock.amount * eachStock.oldPrice)).toFixed(2)),
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
            }
          });
        }
      });
      this.stockAppSocketService
        .getStockUpdated()
        .subscribe((_res: Partial<Stock>) => {
          console.log('stock updated ', _res);
          const { symbol, price, oldPrice } = _res;
          //const prevPrice = eachStock.oldPrice;
          if (price) {
            // price changed, begin computation
            const displayedStockIndex = this.userOwnedStocks.data.findIndex(
              (eachDisplayedStock: UserPortfolioStock) =>
                eachDisplayedStock.symbol === symbol
            );
            if (displayedStockIndex !== -1 && oldPrice !== undefined) {
              console.log(oldPrice);
              console.log('updating stock');
              const foundStock = this.userOwnedStocks.data[displayedStockIndex];
              const changeResult =
                Number.parseFloat((price - (oldPrice ?? foundStock.currentPrice)).toFixed(2));
              const gainLossResult =
                Number.parseFloat(((foundStock.balance * foundStock.currentPrice) -
                (foundStock.balance * price)).toFixed(2));
              const cloneUserStockData = [...this.userOwnedStocks.data];
              const balanceDifference =
                cloneUserStockData[displayedStockIndex].balance -
                foundStock.balance * price;
              const currentPriceDifference =
                cloneUserStockData[displayedStockIndex].currentPrice - price;

              cloneUserStockData[displayedStockIndex] = {
                ...foundStock,
                balance: foundStock.balance,
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
                  neutral: currentPriceDifference === 0
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

  truncateDecimal(decimal: number, amount: number) {
    return decimal.toFixed(amount);
  }
}
