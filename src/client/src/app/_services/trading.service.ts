import { Injectable } from '@angular/core';
import { from, Subject } from 'rxjs';
import { SECRETS } from 'src/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { ConfigService } from '../config/config.service';
import { Stock } from '../_models/Stock';
import { SocketService } from './socket.service';

@Injectable()
export class TradingService {
  constructor(
    private httpClient: ConfigService,
    private socketService: SocketService
  ) {}

  getAllInitialStocks() {
    return this.httpClient.getConfig<Stock[]>(`${ROUTE_PREFIXES.stock}get/all`);
  }

  getUpdates() {
    const socket = this.socketService.getSocket();
    const socketSub = new Subject<Stock>();
    const socketObservable = from(socketSub);

    socket.on('stockUpdated', (stock: Stock) => {
      socketSub.next(stock);
    });

    return socketObservable;
  }

  buyStock = (selectedStock: Stock, selectedAmount: number) => {
    const username = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (username !== null) {
      const buyRequest = this.httpClient.postConfig<boolean>(
        `${ROUTE_PREFIXES.trade}buy`,
        {
          amt: selectedAmount,
          stockSymbol: selectedStock.symbol,
        }
      );
      buyRequest.subscribe();
    }
  };

  sellStock = (selectedStock: Stock, selectedAmount: number) => {
    const username = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (username !== null) {
      const sellRequest = this.httpClient.postConfig<boolean>(
        `${ROUTE_PREFIXES.trade}sell`,
        {
          amt: selectedAmount,
          stockSymbol: selectedStock.symbol,
        }
      );
      sellRequest.subscribe();
    }
  };
}
