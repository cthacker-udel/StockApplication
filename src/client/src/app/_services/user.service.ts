import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { ConfigService } from '../config/config.service';
import { User } from '../_models/User';
import { UserAggregateData } from '../_models/UserAggregateData';

/**
 * The user service, controls all functionality involving users
 */
@Injectable()
export class UserService {
  currentUser: BehaviorSubject<{ user: Partial<User> }>;

  constructor(private httpClient: ConfigService) {
    this.currentUser = new BehaviorSubject({ user: {} });
  }

  updateUser(user: { user: Partial<User> }) {
    this.currentUser.next(user);
  }

  getUserDataWithUsername(username: string): Observable<User> {
    return this.httpClient.getConfig<User>(
      `${ROUTE_PREFIXES.user}data?username=${username}`
    );
  }

  getUserAggregateData(username: string): Observable<UserAggregateData> {
    return this.httpClient.getConfig<UserAggregateData>(
      `${ROUTE_PREFIXES.user}aggregate?username=${username}`
    );
  }
}
