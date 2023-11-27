import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BakerApiService } from '../shared/services/baker-api.service';
import { faAt, faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { styleControl } from '../shared/validations/validations';

@Component({
  selector: 'baker-patrol-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./../login/login.component.css']
})
export class ForgotComponent {
  public success: boolean = false;
  public submitted: boolean = false;
  public error: string | null = null;
  public icons = {at: faAt, gear: faGear, circle: faCircleCheck, triangle: faTriangleExclamation};
  public forgotForm: FormGroup = this._fb.group({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() { }

  onSubmit() {
    this.clearError();
    this.submitted = true;
    this._api.forgot(this.forgotForm.controls['email'].value).subscribe({
      next: s => {
        this.success = true;
        this.submitted = false;
      },
      error: e => {
        this.submitted = false;
        this.error = e.message
      }
    });
  }

  get email() { return this.forgotForm.controls['email']; }

  wasSuccess() { return this.success === true; }

  clearError() { this.error = null; }

  styleControl(): string {
    return styleControl(this.email);
  }

  showAlert(): boolean {
    return this.email.invalid && !this.email.pristine && this.email.touched;
  }
}