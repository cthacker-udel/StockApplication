import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { Stock } from 'src/app/_models/Stock';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'add-stock-dialog',
  templateUrl: './modals/add_stock.dialog.html',
})
export class AddStockModal implements OnInit {
  autocompleteControl = new FormControl('');
  stocks: Stock[] = [];
  filteredOptions: Observable<Stock[]>;

  constructor(private _configService: ConfigService) {}

  ngOnInit(): void {
    const allStocksRequest = this._configService.getConfig<Stock[]>(
      `${ROUTE_PREFIXES.stock}get/all`
    );
    allStocksRequest.subscribe((allStocks: Stock[]) => {
      this.stocks = allStocks;
    });
    this.filteredOptions = this.autocompleteControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterValue(value || ''))
    );
  }

  private filterValue(value: string): Stock[] {
    const filterValue = value.toLowerCase();
    return this.stocks.filter((eachStock: Stock) =>
      eachStock.symbol.toLowerCase().includes(filterValue)
    );
  }
}
