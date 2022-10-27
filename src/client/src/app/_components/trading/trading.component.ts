import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfigService } from 'src/app/config/config.service';
import { Stock } from 'src/app/_models/Stock';
import { TradingService } from 'src/app/_services/trading.service';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css'],
})
export class TradingComponent implements OnInit, AfterViewInit {
  isBuying: boolean = true;
  rawStockData: Stock[];
  stocks: MatTableDataSource<Stock>;
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

  actionBtnClass = this.isBuying
    ? 'btn btn-outline-primary'
    : 'btn btn-outline-success';

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public configService: ConfigService,
    public tradingService: TradingService
  ) {
    this.tradingService.getAllInitialStocks().subscribe((stocks: Stock[]) => {
      this.rawStockData = stocks;
      this.stocks = new MatTableDataSource<Stock>(this.rawStockData);
      const updateObservable = this.tradingService.getUpdates();
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
  }

  ngAfterViewInit(): void {
    this.stocks.paginator = this.paginator;
  }

  calculateDifferenceAndReturnClass = (
    price1: number,
    price2: number
  ): string => {
    const diff = price1 - price2;
    return diff < 0 ? 'dec' : diff > 0 ? 'inc' : 'equal';
  };

  fireAction = (element: Stock) => {
    console.log('fired action with element', element);
  };

  generateActionBtnText = () => (this.isBuying ? 'Buy' : 'Sell');

  roundPriceChange = (price: number): string => {
    return price.toFixed(2);
  };

  switchModes() {
    this.isBuying = !this.isBuying;
  }

  ngOnInit(): void {
    console.log('initialized');
  }
}
