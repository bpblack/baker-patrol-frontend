import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { faTriangleExclamation, faGear, faKey, faAt } from '@fortawesome/free-solid-svg-icons';
import { BakerApiService } from '../shared/services/baker-api.service';
import { styleControl } from '../shared/validations/validations';

@Component({
  selector: 'baker-patrol-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public error: string | null = null;
  public submitted: boolean = false;
  public iat = faAt;
  public ikey = faKey;
  public igear = faGear;
  public itriangle = faTriangleExclamation;
  public loginForm: FormGroup = this._fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  })

  constructor(private _api: BakerApiService, private _router: Router, private _fb: FormBuilder) { }

  onSubmit() {
    this.submitted = true;
    const api = this._api.login(this.loginForm.value).pipe(
      finalize(() => this.submitted = false)
    );
    api.subscribe({
      next: s => this._router.navigate(['/Dash']),
      error:(e: Error) => { this.error = e.message; }
    });
  }

  get email() { return this.loginForm.controls['email']; }

  get password() { return this.loginForm.controls['password']; }

  styleControl(c: AbstractControl): string {
    return styleControl(c);
  }

  showAlert(c: AbstractControl): boolean {
    return c.invalid && !c.pristine && c.touched;
  }

  closeError() { this.error = null; }
}
