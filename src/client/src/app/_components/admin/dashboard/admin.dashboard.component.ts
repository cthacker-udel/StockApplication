import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { SECRETS } from 'src/secrets';

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

  constructor(private _router: Router) {}

  ngOnInit(): void {
    const foundUsername = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (foundUsername === null) {
      this._router.navigateByUrl('stock-dashboard');
    } else {
      const parsedUsername = JSON.parse(foundUsername) as SessionCookie;
      this.loggedInUsername = parsedUsername.value;
    }
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
}
