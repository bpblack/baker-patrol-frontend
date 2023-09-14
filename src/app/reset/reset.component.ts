import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BakerApiService } from '../shared/services/baker-api.service';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize } from 'rxjs';
import { IconDefinition, faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

var passwordRegexp = "^[a-zA-Z0-9!#$%&'\"*+\/=?^_`{|}~.-]{8,72}$";

const confirmPasswordValidator: ValidatorFn = (f: AbstractControl): ValidationErrors | null => {
  const pw = f.get('password');
  const cpw = f.get('confirmPassword');
    if (pw && cpw && pw.value !== cpw.value) {
      console.log("errors");
      return { passwordNoMatch: true };
    } else {
      console.log("no errors");
      return null;
    }
  };

@Component({
  selector: 'baker-patrol-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent {
  public success: boolean;
  public error: string | null = null;
  public submitted: boolean = false;
  public igear: IconDefinition = faGear;
  public icircle: IconDefinition = faCircleCheck;
  public itriangle: IconDefinition = faTriangleExclamation;
  public resetForm: FormGroup = this._fb.group({
            password: new FormControl('', { validators: [Validators.required, Validators.pattern(passwordRegexp)], updateOn: 'blur' }),
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
    this.success = false;
    this.submitted = true;
    this._api.reset(this._token, this.resetForm.value).pipe(
      finalize(() => this.submitted = false),
      catchError((e: Error) => this.error = e.message)
    ).subscribe(s => this.success = true);
  }

  closeError() {
    this.error = null;
  }

  wasSuccess() {
    return this.success === true;
  }

  showAlert(c: AbstractControl) {
    return c.invalid && (!c.pristine || this.submitted);
  }
}
