import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { CONSTANTS } from '../config/constants';

@Injectable()
export class SocketService {
  private socketUrl = CONSTANTS.SOCKET_URL;
  private socket: Socket;

  constructor() {
    this.socket = io(this.socketUrl);
  }

  getSocket() {
    return this.socket;
  }

  closeSocket() {
    this.socket.close();
  }

  openSocket() {
    this.socket.open();
  }
}
