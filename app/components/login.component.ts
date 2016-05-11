import {Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router-deprecated';
import {Http} from '@angular/http';
import {FormBuilder, Validators, Control, ControlGroup, FORM_DIRECTIVES} from '@angular/common';
import {BakerApiService} from '../services/baker-api.service';
import {emailRegexp} from '../validations/validations';

@Component({
  selector: 'baker-patrol-login',
  templateUrl: 'app/views/login.component.html',
  styleUrls: ['app/styles/login.component.css'],
  directives: [RouterLink, FORM_DIRECTIVES]
})

export class LoginComponent {
  error = false;
  loginForm: ControlGroup;
  
  constructor(private _apiService: BakerApiService, private _router: Router, fb: FormBuilder) {
    this.loginForm = fb.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(emailRegexp)]) 
      ],
      password: ['', Validators.compose([
        Validators.required])
      ]
    });
  }

  onSubmit() {
    this._apiService.login(this.loginForm.value).subscribe(
      success => this._router.navigate(['Dash']),
      error => this.error = true 
    );
  }

  hasError() {
    return this.error;
  }

  get diagnostic() { return JSON.stringify({'login': this.loginForm.value}); }
}
