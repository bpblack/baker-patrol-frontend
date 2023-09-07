import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { faTriangleExclamation, faGear } from '@fortawesome/free-solid-svg-icons';
import { BakerApiService } from '../shared/services/baker-api.service';

@Component({
  selector: 'baker-patrol-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  //encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  triangle = faTriangleExclamation;
  gear = faGear;
  errors: boolean[] = [];
  submitted: boolean = false;
  emailBlur: boolean = false;
  loginForm: FormGroup = this._fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  })

  constructor(private _apiService: BakerApiService, private _router: Router, private _fb: FormBuilder) { }

  onSubmit() {
    this.submitted = true;
    const api = this._apiService.login(this.loginForm.value).pipe(
      finalize(() => this.submitted = false)
    );
    api.subscribe({
      next: s => this._router.navigate(['/Dash']),
      error: e => this.errors = [true]
    });
  }
  
  emailFocused() { this.emailBlur = false; }

  emailBlurred() { this.emailBlur = true; }

  get email() { return this.loginForm.controls['email']; }

  get password() { return this.loginForm.controls['password']; }

  closeError() { this.errors = []; }
}
