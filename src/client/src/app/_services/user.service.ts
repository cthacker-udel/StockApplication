import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { ConfigService } from '../config/config.service';
import { User } from '../_models/User';

/**
 * The user service, controls all functionality involving users
 */
@Injectable()
export class UserService {
  constructor(private httpClient: ConfigService) {}

  getUserDataWithUsername(username: string): Observable<User> {
    return this.httpClient.getConfig<User>(
      `${ROUTE_PREFIXES.user}data?username=${username}`
    );
  }
}
