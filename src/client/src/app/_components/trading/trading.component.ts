import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/config/config.service';
import { Stock } from 'src/app/_models/Stock';
import { TradingService } from 'src/app/_services/trading.service';

@Component({
  selector: 'trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css'],
})
export class TradingComponent implements OnInit {
  isBuying: boolean = true;

  constructor(
    public configService: ConfigService,
    public tradingService: TradingService
  ) {}

  switchModes() {
    this.isBuying = !this.isBuying;
  }

  ngOnInit(): void {
    console.log('initialized');
  }

  stocks: Stock[] = [];
}
