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
  ],
})
export class AdminDashboardComponent implements OnInit {
  loggedInUsername: string;
  displayOptions: boolean = false;

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
  }
}
