import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BakerApiService} from '../services/baker-api.service';
import {emailRegexp} from '../validations/validations';

@Component({
  selector: 'baker-patrol-forgot',
  templateUrl: 'app/views/forgot.component.html',
  styleUrls: ['app/styles/login.component.css'],
})

export class ForgotComponent implements OnInit {
  forgotForm: FormGroup;
  message: string;
  success: boolean;
  error: boolean;

  constructor(private _apiService: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.forgotForm = this._fb.group({
      email: ['',Validators.compose([
        Validators.required,
        Validators.pattern(emailRegexp)]) 
	    ]
    });
  }
 
  onSubmit() {
    this.message = null;
    this.success = false;
    this.error = false;
    this._apiService.forgot(this.forgotForm.controls['email'].value).subscribe(
      success => { this.success = true; this.message = 'Check your email for reset instructions.'; },
      error => { this.error = true; this.message = error; } 
    );
  }

  wasSuccess() {
    return this.success == true;
  }

  hasError() {
    return this.error == true;
  }

  get diagnostic() { return JSON.stringify({'email': this.forgotForm.controls['email'].value, 'success': this.wasSuccess(), 'error': this.hasError(), 'message': (<string>this.message)}); }

}
