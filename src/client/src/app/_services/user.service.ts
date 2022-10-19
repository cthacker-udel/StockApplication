import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { User } from '../_models/User';

@Injectable()
export class UserService {
  constructor(public configService: ConfigService) {}

  public findUserByUsername = async (username: string): Promise<boolean> => {
    try {
        const result = await this.configService.getConfigResponse<User>
    }
  }

}
