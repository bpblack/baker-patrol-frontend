import {ControlGroup} from '@angular/common';
import {FormControl} from '@angular/forms';

//SINGLE FIELD VALIDATORS
export var emailRegexp = "[a-zA-Z0-9.!#$%&’*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*";
export var passwordRegexp = "^[a-zA-Z0-9!#$%&'\"*+\/=?^_`{|}~.-]{8,72}$";

//CONTROL GROUP VALIDATORS
export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
  return (group: ControlGroup): {[key: string]: any} => {
    let password = group.controls[passwordKey];
    let confirmPassword = group.controls[confirmPasswordKey];
    
    if (password.value !== confirmPassword.value) {
      return {
        mismatchedPasswords: true
      };
    }
  }
}

export function validateIdSelection(c: FormControl) {
  return c.value > 0 ? null : {validateIdSelection: {valid: false}};
}

