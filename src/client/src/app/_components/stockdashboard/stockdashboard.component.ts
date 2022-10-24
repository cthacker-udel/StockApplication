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
    const configCall = this.configService.getConfig<any>(
      `${ROUTE_PREFIXES.stock}dashboard`
    );
    console.log('call = ', configCall);
    configCall.subscribe((result: any) => {
      console.log(result);
      const { stocks } = result;
      this.stocks = stocks;
    });
  }
}
