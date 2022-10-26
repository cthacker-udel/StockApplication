import { Injectable } from '@angular/core';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { ConfigService } from '../config/config.service';
import { Stock } from '../_models/Stock';
import { io } from 'socket.io-client';
import { from, Subject } from 'rxjs';

@Injectable()
export class DashboardService {
  private socketUrl = 'http://localhost:3001';
  constructor(private httpClient: ConfigService) {}

  getInitialMarketStatus() {
    return this.httpClient.getConfig<Stock[]>(
      `${ROUTE_PREFIXES.stock}dashboard`
    );
  }

  getUpdates() {
    const socket = io(this.socketUrl);
    const stockSub = new Subject<Stock>();
    const stockObservable = from(stockSub);

    socket.on('stockUpdated', (stock: Stock) => {
      stockSub.next(stock);
    });

    return stockObservable;
  }
}
