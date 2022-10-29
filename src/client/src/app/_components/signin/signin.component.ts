import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/config/config.service';
import { SessionCookie } from 'src/app/_models/SessionCookie';
import { SessionService } from 'src/app/_services/session.service';
import { SECRETS } from 'src/secrets/secrets';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { REGEX_EXPRESSIONS } from 'src/shared/constants/regex';

@Component({
  selector: 'sign-in',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SignInComponent implements OnInit {
  constructor(
    public configService: ConfigService,
    private toastr: ToastrService,
    private _router: Router,
    private sessionService: SessionService
  ) {}
  controlNames = ['username', 'password'];
  signInFormGroup: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.signInFormGroup = new FormGroup({
      username: new FormControl('', [
        Validators.minLength(7),
        Validators.maxLength(35),
        Validators.required,
        Validators.pattern(REGEX_EXPRESSIONS.NO_SPACES),
      ]),
      password: new FormControl('', [
        Validators.minLength(7),
        Validators.maxLength(35),
        Validators.required,
        Validators.pattern(REGEX_EXPRESSIONS.NO_SPACES),
      ]),
    });
  }

  get username() {
    return this.signInFormGroup.get('username');
  }

  get password() {
    return this.signInFormGroup.get('password');
  }

  private storeSessionCookies() {}

  signIn() {
    if (this.signInFormGroup.valid) {
      const { controls } = this.signInFormGroup;
      this.configService
        .postConfigResponse<Response>(`${ROUTE_PREFIXES.user}login`, {
          username: controls['username']?.value,
          password: controls['password']?.value,
        })
        .subscribe((result: HttpResponse<Response>) => {
          if (result.status === 400) {
            this.toastr.error('Failed to login');
          } else {
            this.sessionService.addSessionInformation(result.headers);
            this._router.navigateByUrl('stock-dashboard?firstTime=true');
          }
        });
    }
  }
}
