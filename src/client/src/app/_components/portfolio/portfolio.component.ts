import { AfterViewInit, Component } from '@angular/core';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { User } from 'src/app/_models/User';
import { SECRETS } from 'src/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
    selector: 'portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.css'],
})

export class PortfolioComponent implements AfterViewInit {

    ngAfterViewInit(): void {
       /*if (this.stocks) {
          this.stocks.paginator = this.paginator;
        } else if (this.ownedStocks) {
          this.ownedStocks.paginator = this.ownedStocksPaginator;
        }*/
      }
}