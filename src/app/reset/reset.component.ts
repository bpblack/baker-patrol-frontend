import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BakerApiService } from '../shared/services/baker-api.service';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize } from 'rxjs';
import { IconDefinition, faCircleCheck, faGear, faKey, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

var passwordRegexp = "^[a-zA-Z0-9!#$%&'\"*+\/=?^_`{|}~.-]{8,72}$";

const confirmPasswordValidator: ValidatorFn = (f: AbstractControl): ValidationErrors | null => {
  const pw = f.get('password');
  const cpw = f.get('confirmPassword');
    if (pw && cpw && pw.value !== cpw.value) {
      return { passwordNoMatch: true };
    } else {
      return null;
    }
  };

@Component({
  selector: 'baker-patrol-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent {
  public success: boolean = false;
  public error: string | null = null;
  public submitted: boolean = false;
  public ikey: IconDefinition = faKey;
  public igear: IconDefinition = faGear;
  public icircle: IconDefinition = faCircleCheck;
  public itriangle: IconDefinition = faTriangleExclamation;
  public resetForm: FormGroup = this._fb.group({
            password: new FormControl('', { validators: [Validators.required, Validators.pattern(passwordRegexp)]/*, updateOn: 'blur'*/ }),
            confirmPassword: new FormControl('', [Validators.required, Validators.pattern(passwordRegexp)]),
            
    }, {
      validators: confirmPasswordValidator, updateOn: 'change'
    });

  private _token: string;

  constructor(private _api: BakerApiService, private _route: ActivatedRoute, private _fb: FormBuilder) {}

  ngOnInit() {
   this._route.params.subscribe(params => this._token = params['id']);
  }

  onSubmit() {
    this.closeError();
    this.submitted = true;
    this._api.reset(this._token, this.resetForm.value).pipe(
      finalize(() => this.submitted = false)
    ).subscribe({
      next: s => this.success = true,
      error: (e: Error) => this.error = e.message
    });
  }

  closeError() {
    this.error = null;
  }

  wasSuccess() {
    return this.success === true;
  }

  styleControl(c: AbstractControl, invalid: boolean = false): string {
    if (!c.pristine) {
      if (c.valid && !invalid) {
        return 'form-control is-valid';
      }
      return 'form-control is-invalid'
    }
    return 'form-control';
  } 

  get password() { return this.resetForm.controls['password']; }
  
  get confirmPassword() { return this.resetForm.controls['confirmPassword']; }

  showAlert(c: AbstractControl): boolean {
    return c.invalid && !c.pristine && c.touched;
  }

  showFormAlert(): boolean {
    const cw = this.confirmPassword;
    return (this.resetForm.errors?.['passwordNoMatch'] || (cw.invalid && !cw.pristine)) && cw.touched; 
  }
}
