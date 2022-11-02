import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import { from, Subject } from 'rxjs';
import { Stock } from '../_models/Stock';
import { User } from '../_models/User';

@Injectable()
export class StockAppSocketService {
  constructor(private socketService: SocketService) {}

  getStockUpdated() {
    const socket = this.socketService.getSocket();
    const stockSub = new Subject<Stock>();
    const stockSubObservable = from(stockSub);

    socket.on('stockUpdated', (stock: Stock) => {
      stockSub.next(stock);
    });

    return stockSubObservable;
  }

  getUserUpdated() {
    const socket = this.socketService.getSocket();
    const userSub = new Subject<Partial<User>>();
    const userSubObservable = from(userSub);

    socket.on('userUpdated', (user: Partial<User>) => {
      userSub.next(user);
    });

    return userSubObservable;
  }
}
