import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const forbiddenUsernameValidator =
  (usernameRe: RegExp): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const forbidden = usernameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
