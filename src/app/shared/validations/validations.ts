import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function idSelectionValidator(): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      return c.value > 0 ? null : {validateIdSelection: {valid: false}};
    }
  }