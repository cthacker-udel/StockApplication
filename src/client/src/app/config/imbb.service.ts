import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SECRETS } from 'src/secrets';
import { ImageUploadResponse } from '../_models/ImageUploadResponse';
import { ConfigService } from './config.service';

@Injectable()
export class ImbbService {
  private url: string = 'https://api.imgbb.com/1/upload';

  constructor(private httpService: HttpClient) {}

  public uploadImage = async (imgBytes: string) => {
    const request = this.httpService.post<ImageUploadResponse>(
      `${this.url}?key=${SECRETS.IMGBB_APIKEY}`,
      { image: imgBytes }
    );
    request.subscribe((response: ImageUploadResponse) => {
      if (response.status === 200) {
        console.log('success');
      }
    });
  };
}
