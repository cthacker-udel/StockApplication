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
        style({ opacity: 0, bottom: '0vh', left: '0vw' }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 1, bottom: '15vh', left: '10vw' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, bottom: '15vh', left: '10vw' }),
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
          style({ opacity: 1, bottom: '15vh', right: '10vw' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, bottom: '15vh', right: '10vw' }),
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
          style({ opacity: 1, bottom: '9vh', right: '5vw' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, bottom: '9vh', right: '5vw' }),
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
          style({ opacity: 1, bottom: '9vh', left: '5vw' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, bottom: '9vh', left: '5vw' }),
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
          style({ opacity: 1, top: '9vh', right: '5vw' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, top: '9vh', right: '5vw' }),
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
          style({ opacity: 1, top: '9vh', left: '5vw' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, top: '9vh', left: '5vw' }),
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
  displayOptions: boolean = true;
  displaySubOptionsOne: boolean = false;

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
  }

  toggleSubOptionsOne() {
    console.log('flipping');
    this.displaySubOptionsOne = !this.displaySubOptionsOne;
  }
}
