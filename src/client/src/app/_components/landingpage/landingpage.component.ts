import { ConfigService } from './../../config/config.service';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { REGEX_EXPRESSIONS } from 'src/shared/constants/regex';
import { User } from 'src/app/_models/User';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { ApiMessage } from 'src/app/_models/ApiMessage';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'landing-page',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css'],
})
export class LandingPageComponent implements OnInit {
  constructor(
    public configService: ConfigService,
    private toastr: ToastrService
  ) {}
  controlNames = [
    'username',
    'firstName',
    'lastName',
    'dateOfBirth',
    'email',
    'password',
    'confirmPassword',
  ];
  landingPageFormGroup: FormGroup = new FormGroup({});

  usernameAlreadyExists = async (
    control: AbstractControl
  ): Promise<ValidationErrors | null> => {
    const { value } = control;
    const getUsername = this.configService.getConfig<boolean>(
      `${ROUTE_PREFIXES.user}exist/username?username=${value}`
    );
    getUsername.subscribe((doesExist: any) => {
      const { result } = doesExist;
      if (result) {
        this.landingPageFormGroup.controls['username'].setErrors({
          usernameAlreadyExists: true,
        });
      } else {
        if (this.landingPageFormGroup.controls['username'].errors) {
          delete this.landingPageFormGroup.controls['username'].errors[
            'usernameAlreadyExists'
          ];
        }
      }
    });
    return null;
  };

  confirmPasswordDoesNotMatch = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const { value } = control;
    if (this.landingPageFormGroup.get('password')?.value !== value) {
      return { passwordsDoNotMatch: true };
    }
    return null;
  };

  ngOnInit(): void {
    this.landingPageFormGroup = new FormGroup({
      username: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(35),
          Validators.pattern(REGEX_EXPRESSIONS.NO_SPACES),
        ],
        [this.usernameAlreadyExists]
      ),
      firstName: new FormControl('', [
        Validators.maxLength(35),
        Validators.pattern(REGEX_EXPRESSIONS.NO_SPACES),
      ]),
      lastName: new FormControl('', [
        Validators.maxLength(35),
        Validators.pattern(REGEX_EXPRESSIONS.NO_SPACES),
      ]),
      dateOfBirth: new FormControl(new Date(Date.now()), [Validators.required]),
      email: new FormControl('', [Validators.maxLength(70), Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(35),
        Validators.pattern(REGEX_EXPRESSIONS.NO_SPACES),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.maxLength(35),
        this.confirmPasswordDoesNotMatch,
      ]),
    });
  }

  get username() {
    return this.landingPageFormGroup.get('username');
  }

  get firstName() {
    return this.landingPageFormGroup.get('firstName');
  }

  get lastName() {
    return this.landingPageFormGroup.get('lastName');
  }

  get dateofbirth() {
    return this.landingPageFormGroup.get('dateOfBirth');
  }

  get email() {
    return this.landingPageFormGroup.get('email');
  }

  get password() {
    return this.landingPageFormGroup.get('password');
  }

  get confirmPassword() {
    return this.landingPageFormGroup.get('confirmPassword');
  }

  signUp() {
    if (this.landingPageFormGroup.valid) {
      const { controls } = this.landingPageFormGroup;
      this.configService
        .postConfig<ApiMessage>(`${ROUTE_PREFIXES.user}signup`, {
          firstName: controls['firstName']?.value,
          lastName: controls['lastName']?.value,
          dob: new Date(controls['dateOfBirth'].value).toUTCString(),
          email: controls['email']?.value,
          username: controls['username'].value,
          password: controls['password'].value,
          balance: 1200,
        })
        .subscribe((result: ApiMessage) => {
          if (result.success) {
            this.toastr.success('Signed up Successfully!');
            this.controlNames.forEach((eachName: string) => {
              this.landingPageFormGroup.controls[eachName].setValue('');
              this.landingPageFormGroup.controls[eachName].setErrors(null);
            });
          } else {
            this.toastr.error('Failed to sign up, please try again later.');
          }
        });
    }
  }
}
