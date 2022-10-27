import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/config/config.service';
import { Stock } from 'src/app/_models/Stock';
import { TradingService } from 'src/app/_services/trading.service';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css'],
})
export class TradingComponent implements OnInit {
  isBuying: boolean = true;
  stocks: Stock[];

  constructor(
    public configService: ConfigService,
    public tradingService: TradingService
  ) {
    const request = this.configService.getConfig<Stock[]>(
      `${ROUTE_PREFIXES.stock}get/all`
    );
    request.subscribe((initialValue: Stock[]) => {
      console.log('received = ', initialValue);
      this.stocks = initialValue;
    });
  }

  switchModes() {
    this.isBuying = !this.isBuying;
  }

  ngOnInit(): void {
    console.log('initialized');
  }
}
