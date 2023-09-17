import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BakerApiService } from '../shared/services/baker-api.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { IconDefinition, faCircleCheck, faGear, faKey, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { matchValidator, passwordRegexp, styleControl } from '../shared/validations/validations';

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
            password: new FormControl('', { validators: [Validators.required, Validators.pattern(passwordRegexp)] }),
            confirmPassword: new FormControl('', [Validators.required, Validators.pattern(passwordRegexp)]),
            
    }, {
      validators: matchValidator('password', 'confirmPassword'), updateOn: 'change'
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

  get password() { return this.resetForm.controls['password']; }
  
  get confirmPassword() { return this.resetForm.controls['confirmPassword']; }

  showAlert(c: AbstractControl): boolean {
    return c.invalid && !c.pristine && c.touched;
  }

  styleControl(c: AbstractControl, isValid: boolean = false) {
    return styleControl(c, isValid);
  }

  showFormAlert(): boolean {
    const cw = this.confirmPassword;
    return (this.resetForm.errors?.['noMatch'] || (cw.invalid && !cw.pristine)) && cw.touched; 
  }
}
