import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faGear, faKey } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';
import { BakerApiService } from 'src/app/shared/services/baker-api.service';
import { matchValidator, noMatchValidator, passwordRegexp, styleControl } from 'src/app/shared/validations/validations';

interface Result {
  type: string;
  msg: string;
}

@Component({
    selector: 'baker-update-password',
    templateUrl: './update-password.component.html',
    standalone: false
})
export class UpdatePasswordComponent {
  public submitted: boolean = false;
  public message: Result | null = null;
  public ikey: IconDefinition = faKey;
  public igear: IconDefinition = faGear;
  public updatePass: FormGroup = this._fb.group({
    password: new FormControl('', Validators.required),
    new_password: new FormControl('', Validators.compose([Validators.required, Validators.pattern(passwordRegexp)])),
    confirm_password: new FormControl('', Validators.compose([Validators.required, Validators.pattern(passwordRegexp)])),      
  }, {
    validators: Validators.compose([noMatchValidator('password', 'new_password'), matchValidator('new_password', 'confirm_password')]), updateOn: 'change'
  });

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }

  get password() { return this.updatePass.controls['password']; }

  get newPassword() { return this.updatePass.controls['new_password']; }

  get confirmPassword() { return this.updatePass.controls['confirm_password']; }

  clearMessage() {
    this.message = null;
  }

  styleCurControl(a: AbstractControl) {
    return styleControl(a, this.updatePass.errors?.['match']);
  }

  styleNewControl(a: AbstractControl) {
    return styleControl(a, this.updatePass.errors?.['noMatch']);
  }

  showCurAlert() {
    return this.password.touched && this.updatePass.errors?.['match'];
  }

  showNewAlert() {
    return this.newPassword.touched && this.confirmPassword.touched && this.updatePass.invalid;
  }

  submit() {
    this.submitted = true;
    this.message = null;
    this._api.updateUser(this.updatePass.value).pipe(
      finalize(() => this.submitted = false)
    ).subscribe({
      next: (b: boolean) => { 
        this.updatePass.reset();
        this.message = {type: 'success', msg: 'Successfully updated your password.'}; 
      }, 
      error: (e: Error) => {
        this.message = {type: 'danger', msg: e.message};
      }
    });
  }

  blur(a: AbstractControl) {
    if (a.value === '') {
      a.reset();
      a.setValue('');
    }
  }
}
