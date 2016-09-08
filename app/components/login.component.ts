import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BakerApiService} from '../services/baker-api.service';
import {emailRegexp} from '../validations/validations';

@Component({
  selector: 'baker-patrol-login',
  templateUrl: 'app/views/login.component.html',
  styleUrls: ['app/styles/login.component.css']
})

export class LoginComponent implements OnInit {
  error = false;
  loginForm: FormGroup;
  
  constructor(private _apiService: BakerApiService, private _router: Router, private _fb: FormBuilder) {}

  ngOnInit() {
    this.loginForm = this._fb.group({
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
      success => this._router.navigate(['/Dash']),
      error => this.error = true 
    );
  }

  hasError() {
    return this.error;
  }

  emailRegexp() {
    return emailRegexp;
  }

  get diagnostic() { return JSON.stringify({'login': this.loginForm.value}); }
}
