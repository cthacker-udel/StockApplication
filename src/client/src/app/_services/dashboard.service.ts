import { Injectable } from '@angular/core';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { ConfigService } from '../config/config.service';
import { Stock } from '../_models/Stock';
import { io } from 'socket.io-client';
import { from, Subject } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable()
export class DashboardService {
  constructor(
    private httpClient: ConfigService,
    private socketService: SocketService
  ) {}

  getInitialMarketStatus() {
    return this.httpClient.getConfig<Stock[]>(
      `${ROUTE_PREFIXES.stock}dashboard`
    );
  }

  getUpdates() {
    const socket = this.socketService.getSocket();
    const stockSub = new Subject<Stock>();
    const stockObservable = from(stockSub);

    socket.on('stockUpdated', (stock: Stock) => {
      stockSub.next(stock);
    });

    return stockObservable;
  }
}
