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
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public configService: ConfigService,
    public tradingService: TradingService
  ) {
    this.tradingService.getAllInitialStocks().subscribe((stocks: Stock[]) => {
      console.log('received = ', stocks);
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

  switchModes() {
    this.isBuying = !this.isBuying;
  }

  ngOnInit(): void {
    console.log('initialized');
  }
}
