import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { Stock } from 'src/app/_models/Stock';
import { SECRETS } from 'src/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'add-stock-dialog',
  templateUrl: './modals/add_stock.dialog.html',
})
export class AddStockDialog {}

@Component({
  selector: 'admin-dashboard',
  templateUrl: './admin.dashboard.component.html',
  styleUrls: ['./admin.dashboard.component.css'],
  animations: [
    trigger('firstOptionAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          bottom: '0vh',
          left: '0vw',
        }),
        animate(
          '.75s ease-in-out',
          style({
            opacity: 1,
            bottom: 'calc(100%)',
            left: 'calc(100% + 1vw)',
          })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, bottom: 'calc(100%)', left: 'calc(100% + 1vw)' }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 0, bottom: '0vh', left: '0vw' })
        ),
      ]),
    ]),
    trigger('secondOptionAnimation', [
      transition(':enter', [
        style({ opacity: 0, bottom: '0vh', right: '0vw' }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 1, bottom: 'calc(100%)', right: 'calc(100% + 1vw)' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, bottom: 'calc(100%)', right: 'calc(100% + 1vw)' }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 0, bottom: '0vh', right: '0vw' })
        ),
      ]),
    ]),
    trigger('subOption1Animation', [
      transition(':enter', [
        style({ opacity: 0, bottom: '0vh', right: '0vw' }),
        animate(
          '.75s ease-in-out',
          style({
            opacity: 1,
            bottom: 'calc(100% - 5.5vh)',
            right: 'calc(100% - 2vw)',
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          bottom: 'calc(100% - 5.5vh)',
          right: 'calc(100% - 2vw)',
        }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 0, bottom: '0vh', right: '0vw' })
        ),
      ]),
    ]),
    trigger('subOption2Animation', [
      transition(':enter', [
        style({ opacity: 0, bottom: '0vh', left: '0vw' }),
        animate(
          '.75s ease-in-out',
          style({
            opacity: 1,
            bottom: 'calc(100% - 5.5vh)',
            left: 'calc(100% - 2vw)',
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          bottom: 'calc(100% - 5.5vh)',
          left: 'calc(100% - 2vw)',
        }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 0, bottom: '0vh', left: '0vw' })
        ),
      ]),
    ]),
    trigger('subOption3Animation', [
      transition(':enter', [
        style({ opacity: 0, top: '0vh', right: '0vw' }),
        animate(
          '.75s ease-in-out',
          style({
            opacity: 1,
            top: 'calc(100% - 5.5vh)',
            right: 'calc(100% - 2vw)',
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          top: 'calc(100% - 5.5vh)',
          right: 'calc(100% - 2vw)',
        }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 0, top: '0vh', right: '0vw' })
        ),
      ]),
    ]),
    trigger('subOption4Animation', [
      transition(':enter', [
        style({ opacity: 0, top: '0vh', left: '0vw' }),
        animate(
          '.75s ease-in-out',
          style({
            opacity: 1,
            top: 'calc(100% - 5.5vh)',
            left: 'calc(100% - 2vw)',
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          top: 'calc(100% - 5.5vh)',
          left: 'calc(100% - 2vw)',
        }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 0, top: '0vh', left: '0vw' })
        ),
      ]),
    ]),
  ],
})
export class AdminDashboardComponent implements OnInit {
  loggedInUsername: string;
  displayOptions: boolean = false;
  displaySubOptionsOne: boolean = false;
  displaySubOptionsTwo: boolean = false;

  autocompleteControl = new FormControl('');
  stocks: Stock[] = [];
  filteredOptions: Observable<Stock[]>;

  constructor(
    private _router: Router,
    private _configService: ConfigService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const foundUsername = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    const allStocksRequest = this._configService.getConfig<Stock[]>(
      `${ROUTE_PREFIXES.stock}get/all`
    );
    if (foundUsername === null) {
      this._router.navigateByUrl('stock-dashboard');
    } else {
      const parsedUsername = JSON.parse(foundUsername) as SessionCookie;
      this.loggedInUsername = parsedUsername.value;
    }
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

  toggleFirstLayerDisplay() {
    this.displayOptions = !this.displayOptions;
    this.displaySubOptionsOne = false;
    this.displaySubOptionsTwo = false;
  }

  toggleSubOptionsOne() {
    this.displaySubOptionsOne = !this.displaySubOptionsOne;
  }

  toggleSubOptionsTwo() {
    this.displaySubOptionsTwo = !this.displaySubOptionsTwo;
  }

  openDialog(key: string) {
    let dialogRef;
    switch (key) {
      case 'addStock': {
        dialogRef = this.dialog.open(AddStockDialog);
        break;
      }
    }
    dialogRef?.afterClosed().subscribe((result) => {
      console.log('Dialog result', result);
    });
  }
}
