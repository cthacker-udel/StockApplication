import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/config/config.service';
import { Stock } from 'src/app/_models/Stock';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'stock-dashboard',
  templateUrl: './stockdashboard.component.html',
  styleUrls: ['./stockdashboard.component.css'],
})
export class StockDashboardComponent implements OnInit {
  constructor(
    public configService: ConfigService,
    private toastr: ToastrService
  ) {}

  stocks: Stock[] = [];

  ngOnInit(): void {
    this.toastr.success('Welcome to the stock application!', 'Welcome!');
    this.configService
      .getConfig<{ stocks: Stock[] }>(`${ROUTE_PREFIXES.stock}dashboard`)
      .subscribe((result: { stocks: Stock[] }) => {
        console.log('reuslt = ', result);
        const { stocks } = result;
        this.stocks = stocks;
      });
  }
}
