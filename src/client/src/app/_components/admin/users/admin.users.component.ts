import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-user',
  templateUrl: './admin.users.component.html',
  styleUrls: ['./admin.users.component.css'],
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
    trigger('thirdOptionAnimation', [
      transition(':enter', [
        style({ opacity: 0, top: '0vh', right: '0vw' }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 1, top: '15vh', right: '10vw' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, top: '15vh', right: '10vw' }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 0, top: '0vh', right: '0vw' })
        ),
      ]),
    ]),
    trigger('fourthOptionAnimation', [
      transition(':enter', [
        style({ opacity: 0, top: '0vh', left: '0vw' }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 1, top: '15vh', left: '10vw' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, top: '15vh', left: '10vw' }),
        animate(
          '.75s ease-in-out',
          style({ opacity: 0, top: '0vh', left: '0vw' })
        ),
      ]),
    ]),
  ],
})
export class AdminUserComponent implements OnInit {
  display_options: boolean = false;
  ngOnInit(): void {}

  triggerDisplayOptions() {
    console.log('flipping display options');
    this.display_options = !this.display_options;
  }
}
