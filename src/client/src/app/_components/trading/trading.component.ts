import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSliderChange } from '@angular/material/slider';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable, startWith } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { OwnedStock } from 'src/app/_models/OwnedStock';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { User } from 'src/app/_models/User';
import { StockAppSocketService } from 'src/app/_services/stockappsocket.service';
import { TradingService } from 'src/app/_services/trading.service';
import { SECRETS } from 'src/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css'],
})
export class TradingComponent implements AfterViewInit {
  isBuying: boolean = true;
  rawStockData: Stock[];
  stocks: MatTableDataSource<Stock>;
  ownedStocks: MatTableDataSource<OwnedStock>;
  columndefs: any[] = [
    'Symbol',
    'Price',
    'Previous Price',
    'Price Change',
    'Total Shares',
    'Volume',
    'Risk',
    'Actions',
  ];

  sellingColumnDefs: any[] = ['Symbol', 'Amount', 'Sell'];

  actionStock: Stock;
  sellStock: OwnedStock;

  selectedStockAmount = 0;

  actionBtnClass = this.isBuying
    ? 'btn btn-outline-primary'
    : 'btn btn-outline-success';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) ownedStocksPaginator: MatPaginator;

  constructor(
    public configService: ConfigService,
    public tradingService: TradingService,
    public stockAppSocketService: StockAppSocketService
  ) {
    this.tradingService.getAllInitialStocks().subscribe((stocks: Stock[]) => {
      this.rawStockData = stocks;
      this.stocks = new MatTableDataSource<Stock>(this.rawStockData);
      this.ownedStocks = new MatTableDataSource<OwnedStock>();

      const updateObservable = this.stockAppSocketService.getStockUpdated();
      updateObservable.subscribe((latestUpdate: Stock) => {
        const index = this.rawStockData.findIndex(
          (eachStock) => eachStock.symbol === latestUpdate.symbol
        );
        this.rawStockData = [...this.rawStockData].map((_, i) =>
          i === index ? latestUpdate : _
        );
        this.stocks.data = this.rawStockData;
      });
    });
    const usernameHeader = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (usernameHeader !== null) {
      const parsedUsername = JSON.parse(usernameHeader) as SessionCookie;
      const ownedStocks = this.configService.getConfig<OwnedStock[]>(
        `${ROUTE_PREFIXES.user}ownedStocks?username=${parsedUsername.value}`
      );
      ownedStocks.subscribe((userOwnedStocks: OwnedStock[]) => {
        if (this.ownedStocks) {
          this.ownedStocks.data = userOwnedStocks;
        }
      });
      this.stockAppSocketService
        .getUserUpdated()
        .subscribe((_res: Partial<User>) => {
          if (this.ownedStocks && _res.portfolio) {
            const {
              portfolio: { stocks },
            } = _res;
            this.ownedStocks.data = stocks;
          }
        });
    }
  }

  ngAfterViewInit(): void {
    if (this.stocks) {
      this.stocks.paginator = this.paginator;
    } else if (this.ownedStocks) {
      this.ownedStocks.paginator = this.ownedStocksPaginator;
    }
  }

  calculateDifferenceAndReturnClass = (
    price1: number,
    price2: number
  ): string => {
    const diff = price1 - price2;
    return diff < 0 ? 'dec' : diff > 0 ? 'inc' : 'equal';
  };

  fireAction = (element: Stock) => {
    this.actionStock = element;
  };

  fireActionSell = (element: OwnedStock) => {
    this.sellStock = element;
  };

  generateActionBtnText = () => (this.isBuying ? 'Buy' : 'Sell');

  roundPriceChange = (price: number): string => {
    return price.toFixed(2);
  };

  switchModes() {
    this.isBuying = !this.isBuying;
  }

  selectedStockAmountChangeHandler(event: MatSliderChange) {
    if (event.value !== null) {
      this.selectedStockAmount = event.value;
    }
  }

  displayPrice = (type: string): string =>
    type === 'buy'
      ? Math.round(this.actionStock.price * this.selectedStockAmount).toFixed(2)
      : (
          this.stocks.data.find(
            (eachStock: Stock) => eachStock.symbol === this.sellStock.symbol
          )!.price * this.selectedStockAmount
        ).toFixed(2);

  executeTrade() {
    this.isBuying
      ? this.tradingService.buyStock(this.actionStock, this.selectedStockAmount)
      : this.tradingService.sellStock(this.sellStock, this.selectedStockAmount);
    this.selectedStockAmount = 0;
  }
}
