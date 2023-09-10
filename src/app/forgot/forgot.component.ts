import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BakerApiService } from '../shared/services/baker-api.service';
import { faCircleCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'baker-patrol-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./../login/login.component.css']
})
export class ForgotComponent {
  icheck = faCircleCheck;
  itriangle = faTriangleExclamation;
  success: boolean = false;
  submitted: boolean = false;
  emailBlur: boolean = false;
  errors: Array<string> = [];
  forgotForm: FormGroup = this._fb.group({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() { }

  onSubmit() {
    this.clearError();
    this.submitted = true;
    this._api.forgot(this.forgotForm.controls['email'].value).subscribe({
      next: s => this.submitted = false,
      error: e => {
        this.submitted = false;
        this.errors.push(e);
      }
    });
  }

  emailFocused() { this.emailBlur = false; }

  emailBlurred() { this.emailBlur = true; }

  get email() { return this.forgotForm.controls['email']; }

  wasSuccess() { return this.success === true; }

  clearError() { this.errors = []; }
}