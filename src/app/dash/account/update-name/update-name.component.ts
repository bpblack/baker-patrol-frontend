import { Component, Input, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';
import { BakerApiService } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

interface Result {
  type: string;
  msg: string;
}

function nameValidator(fn: string, ln: string): ValidatorFn {
  return (f: AbstractControl): ValidationErrors | null => {
    const fp = f.get('first_name');
    const lp = f.get('last_name');
    if ((fn+ln) === (fp?.value+lp?.value)) {
      return {nameMatch: true}
    } else {
      return null;
    }
  }
}

@Component({
  selector: 'baker-update-name',
  templateUrl: './update-name.component.html'
})
export class UpdateNameComponent {
  public message: Result | null = null;
  public submitted: boolean = false;
  public igear: IconDefinition = faGear;
  @Input() firstName: string = '';
  @Input() lastName: string = '';

  // forms
  public updateName: FormGroup = this._fb.group({
    first_name: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.pattern("^[a-zA-Z].*")])),
    last_name: new FormControl('', Validators.compose([Validators.required,Validators.minLength(2), Validators.pattern("^[a-zA-Z].*")]))
  });

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }

  ngOnChanges(c: SimpleChanges) {
    this.updateName.clearValidators();
    this.updateName.addValidators(nameValidator(this.firstName, this.lastName));
  }

  get firstNameInput() { return this.updateName.controls['first_name']; }

  get lastNameInput() { return this.updateName.controls['last_name']}

  clearMessage() {
    this.message = null;
  }

  styleControl(a: AbstractControl) {
    return styleControl(a, this.updateName.errors?.['nameMatch']);
  }

  showAlert() {
    return !this.firstNameInput.pristine && !this.lastNameInput.pristine && this.updateName.errors?.['nameMatch'];
  }

  submit() {
    this.submitted = true;
    this.message = null;
    this._api.updateUser(this.updateName.value).pipe(
      finalize(() => {
        this.submitted = false;
      })
    ).subscribe({
      next: (b: boolean) => {
        this.updateName.reset();
        this.message = {type: 'success', msg: 'Successfully updated your name.'}; 
      },
      error: (e: Error) => {
        this.message = {type: 'danger', msg: e.message};
      }
    });
  }

  blur(a: AbstractControl) {
    if (a.value === '') {
      a.reset();
      a.setValue('');
    }
  }
}
