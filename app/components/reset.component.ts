import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BakerApiService} from '../services/baker-api.service';
import {passwordRegexp, matchingPasswords} from '../validations/validations';
import {BakerApiError} from './error.component';

@Component({
  selector: 'baker-patrol-reset',
  templateUrl: 'app/views/reset.component.html',
  styleUrls: ['app/styles/login.component.css'],
  directives: [FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, BakerApiError]
})

export class ResetComponent implements OnInit {
  resetForm: FormGroup;
  success: boolean;
  error: string;
  private _token: string;

  constructor(private _apiService: BakerApiService, private _route: ActivatedRoute, private _fb: FormBuilder) {}

  ngOnInit() {
    this.resetForm = this._fb.group(
      {
        password: ['', Validators.compose([Validators.required, Validators.pattern(passwordRegexp)])],
        confirm_password: ['', Validators.compose([Validators.required, Validators.pattern(passwordRegexp)])],
      }, 
      {
        validator: matchingPasswords('password', 'confirm_password')
      }
    );
    this._route.params.subscribe(params => {this._token = params['id']});
  }

  onSubmit() {
    this.success = false;
    this.error=null;
    this._apiService.reset(this._token, this.resetForm.value).subscribe(
	    success => { this.success = true; },
	    error => { this.error = error; } 
    );
  }

  wasSuccess() {
    return this.success == true;
  }

  get diagnostic() { return JSON.stringify({'token': this._token, 'resetForm': this.resetForm.value, 'pw': this.resetForm.controls['password'].valid, 'mismatched': this.resetForm.hasError('mismatchedPasswords')}); }

}
