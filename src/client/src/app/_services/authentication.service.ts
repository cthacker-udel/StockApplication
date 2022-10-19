import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { User } from '../_models/User';

@Injectable()
export class AuthenticationService {
  constructor(public configService: ConfigService) {}

  public verifyUsername = (username: string): Promise<boolean> => {
    const result = await this.configService.getConfigResponse<User>('');
  };
}
