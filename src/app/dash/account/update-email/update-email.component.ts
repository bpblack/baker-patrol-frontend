import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faAt, faGear } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';
import { BakerApiService } from 'src/app/shared/services/baker-api.service';
import { differenceValidator, styleControl } from 'src/app/shared/validations/validations';

interface Result {
  type: string;
  msg: string;
}

@Component({
  selector: 'baker-update-email',
  templateUrl: './update-email.component.html'
})
export class UpdateEmailComponent {
  public submitted: boolean = false;
  public message: Result | null = null;
  public iat: IconDefinition = faAt;
  public igear: IconDefinition= faGear;
  public updateEmail: FormGroup;
  @Input({required: true}) email: string = '';
  
  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }

  ngOnInit() {
    this.updateEmail = this._fb.group({
      email: new FormControl('', Validators.compose([Validators.required, Validators.email, differenceValidator(this.email)]))
    });
  }

  emailValid(): boolean {
    const e = this.updateEmail.controls['email'];
    return e.invalid && !e.pristine && e.touched;
  }
  
  styleControl(): string {
    return styleControl(this.updateEmail.controls['email']);
  }

  clearMessage() {
    this.message = null;
  }

  submit() {
    this.submitted = true;
    this.message = null;
    this._api.updateUser(this.updateEmail.value).pipe(
      finalize(() => this.submitted = false)
    ).subscribe({
      next: (b: boolean) => { 
        this.updateEmail.reset();
        this.message = {type: 'success', msg: 'Successfully updated your email.'}; 
      }, 
      error: (e: Error) => this.message = {type: 'danger', msg: e.message}
    })
  }

  blur() {
    const e = this.updateEmail.controls['email'];
    if (e.value === '') {
      e.reset();
      e.setValue('');
    }
  }
}
