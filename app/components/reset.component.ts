import {Component} from '@angular/core';
import {Router, RouterLink, RouteParams} from '@angular/router-deprecated';
import {FormBuilder, Validators, Control, ControlGroup, FORM_DIRECTIVES} from '@angular/common';
import {BakerApiService} from '../services/baker-api.service';
import {passwordRegexp, matchingPasswords} from '../validations/validations';

@Component({
  selector: 'baker-patrol-reset',
  templateUrl: 'app/views/reset.component.html',
  styleUrls: ['app/styles/login.component.css'],
  directives: [RouterLink, FORM_DIRECTIVES]
})

export class ResetComponent {
  resetForm: ControlGroup;
  success: boolean;
  error: boolean;
  message: string;

  constructor(private _apiService: BakerApiService, private _router: Router, private _routeParams: RouteParams, fb: FormBuilder) {
    this.resetForm = fb.group(
      {
        password: ['', Validators.compose([Validators.required, Validators.pattern(passwordRegexp)])],
        confirm_password: ['', Validators.compose([Validators.required, Validators.pattern(passwordRegexp)])],
      }, 
      {
        validator: matchingPasswords('password', 'confirm_password')
      }
    );
  }

  onSubmit() {
    this.success = false;
    this.error = false;
    this.message='';
    this._apiService.reset(this._routeParams.get('id'), this.resetForm.value).subscribe(
	    success => { this.success = true; },
	    error => { this.error = true; this.message = error; } 
    );
  }

  wasSuccess() {
    return this.success == true;
  }

  hasError() {
    return this.error == true;
  }

  get diagnostic() { return JSON.stringify({'resetForm': this.resetForm.value, 'pw': this.resetForm.controls['password'].valid, 'mismatched': this.resetForm.hasError('mismatchedPasswords')}); }

}
