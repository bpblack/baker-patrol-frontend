import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faGear, faPhone } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';
import { BakerApiService } from 'src/app/shared/services/baker-api.service';
import { differenceValidator, styleControl } from 'src/app/shared/validations/validations';

interface Result {
  type: string;
  msg: string;
}

@Component({
  selector: 'baker-update-phone',
  templateUrl: './update-phone.component.html'
})
export class UpdatePhoneComponent {
  public submitted: boolean = false;
  public message: Result | null = null;
  public igear: IconDefinition= faGear;
  public iphone: IconDefinition = faPhone;
  @Input({required: true}) phone: string = '';
  
  // forms
  public updatePhone: FormGroup = this._fb.group({
    phone: new FormControl('')
  });

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }

  ngOnChange(c: SimpleChanges) {
    this.updatePhone.controls['phone'].clearValidators();
    this.updatePhone.controls['phone'].addValidators([
      Validators.required, 
      Validators.pattern("^\\([1-9][0-9]{2}\\)[1-9][0-9]{2}\\-[0-9]{4}$"),
      differenceValidator(this.phone)
    ]);
  }

  phoneValid(): boolean {
    const e = this.updatePhone.controls['phone'];
    return e.invalid && !e.pristine && e.touched;
  }
  
  styleControl(): string {
    return styleControl(this.updatePhone.controls['phone']);
  }

  clearMessage() {
    this.message = null;
  }

  submit() {
    this.submitted = true;
    this.message = null;
    this._api.updateUser(this.updatePhone.value).pipe(
      finalize(() => this.submitted = false)
    ).subscribe({
      next: (m: boolean) => {
        this.updatePhone.reset();
        this.message = {type: 'success', msg: 'Successfully updated your phone number.'};
      },
      error: (e: Error) => {
        this.message = {type: 'danger', msg: e.message};
      }
    })
  }

  blur() {
    const p = this.updatePhone.controls['phone'];
    if (p.value === '') {
      p.reset();
      p.setValue('');
    }
  }
}
