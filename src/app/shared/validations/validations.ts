import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const passwordRegexp = "^[a-zA-Z0-9!#$%&'\"*+\/=?^_`{|}~.-]{8,72}$";

export function matchValidator(val1: string, val2: string): ValidatorFn {
  return (f: AbstractControl): ValidationErrors | null => {
    const m1 = f.get(val1);
    const m2 = f.get(val2);
    if (m1 && m2 && m1.value !== m2.value) {
      return { noMatch: true };
    } else {
      return null;
    }
  };
}

export function differenceValidator(val: string): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const cmp: string = c.value;
    return (cmp && cmp === val) ? { match: true } : null; 
  }
}

export function idSelectionValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    return c.value > 0 ? null : {validateIdSelection: {valid: false}};
  }
}

export function  styleControl(c: AbstractControl, invalid: boolean = false): string {
  if (!c.pristine) {
    if (c.valid && !invalid) {
      return 'form-control is-valid';
    }
    return 'form-control is-invalid'
  }
  return 'form-control';
}