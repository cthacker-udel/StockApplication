import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/config/config.service';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';

@Component({
  selector: 'sign-in',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SignInComponent implements OnInit {
  constructor(
    public configService: ConfigService,
    private toastr: ToastrService
  ) {}
  controlNames = ['username', 'password'];
  signInFormGroup: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.signInFormGroup = new FormGroup({
      username: new FormControl('', [
        Validators.minLength(7),
        Validators.maxLength(35),
      ]),
      password: new FormControl('', [
        Validators.minLength(7),
        Validators.maxLength(35),
      ]),
    });
  }

  get username() {
    return this.signInFormGroup.get('username');
  }

  get password() {
    return this.signInFormGroup.get('password');
  }

  signIn() {
    if (this.signInFormGroup.valid) {
      const { controls } = this.signInFormGroup;
      this.configService
        .postConfig<Response>(`${ROUTE_PREFIXES.user}login`, {
          username: controls['username']?.value,
          password: controls['password']?.value,
        })
        .subscribe((result: Response) => {
          if (result.status === 400) {
            this.toastr.error('Failed to login');
          } else {
            this.toastr.success('Login Succeeded!');
          }
        });
    }
  }
}
