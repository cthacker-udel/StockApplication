import { Injectable } from '@angular/core';
import { from, Subject } from 'rxjs';
import { Stock } from '../_models/Stock';
import { SocketService } from './socket.service';

@Injectable()
export class SidebarService {
  constructor(private socketService: SocketService) {}

  getUpdates() {
    const socket = this.socketService.getSocket();
    const socketSub = new Subject<Stock>();
    const socketObservable = from(socketSub);

    socket.on('stockUpdated', (stock: Stock) => {
      socketSub.next(stock);
    });

    return socketObservable;
  }
}
