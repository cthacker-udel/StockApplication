import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-add-stock',
  templateUrl: './admin.addstocks.component.html',
  styleUrls: ['./admin.addstocks.component.css'],
})
export class AdminAddStocksComponent {
  symbol = new FormControl<string>('');
  price = new FormControl<number>(0);
  shares = new FormControl<number>(0);
  volume = new FormControl<number>(0);
  risk = new FormControl<number>(0);
  constructor(private _router: Router) {}

  symbolChange = (event: Event) => {
    const { value } = (event as InputEvent).target as HTMLInputElement;
    this.symbol.setValue(value);
  };

  priceChange = (event: Event) => {
    const { value } = (event as InputEvent).target as HTMLInputElement;
    this.price.setValue(Number.parseInt(value, 10));
  };

  sharesChange = (event: Event) => {
    const { value } = (event as InputEvent).target as HTMLInputElement;
    this.shares.setValue(Number.parseInt(value, 10));
  };

  volumeChange = (event: Event) => {
    const { value } = (event as InputEvent).target as HTMLInputElement;
    this.volume.setValue(Number.parseInt(value, 10));
  };

  riskChange = (event: Event) => {
    const { value } = (event as InputEvent).target as HTMLInputElement;
    this.risk.setValue(Number.parseInt(value, 10));
  };
}
