import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ConfigService } from 'src/app/config/config.service';
import { REGEX_EXPRESSIONS } from 'src/shared/constants/regex';

@Component({
  selector: 'landing-page',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css'],
})
export class LandingPageComponent implements OnInit {
  landingPageFormGroup: FormGroup = new FormGroup({});

  constructor(configService: ConfigService) {}

  usernameAlreadyExists = async (
    control: AbstractControl
  ): Promise<ValidationErrors | null> => {
    const { value } = control;
    // check database for username
    return null;
  };

  passwordsDoNotMatch = (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (this.landingPageFormGroup.get('password') !== value) {
      return { confirmPassword: { value: value } };
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
        this.passwordsDoNotMatch,
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

  get email() {
    return this.landingPageFormGroup.get('email');
  }

  get password() {
    return this.landingPageFormGroup.get('password');
  }

  get confirmPassword() {
    return this.landingPageFormGroup.get('confirmPassword');
  }

  printValue() {
    console.log(this.landingPageFormGroup);
  }
}
