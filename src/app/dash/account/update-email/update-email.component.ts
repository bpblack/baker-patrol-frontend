import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faAt, faGear } from '@fortawesome/free-solid-svg-icons';
import { catchError, finalize, map, of } from 'rxjs';
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
      finalize(() => this.submitted = false),
      map(r => {
        const m: Result = {type: 'success', msg: 'Successfully updated your email.'};
        return m;
      }),
      catchError((e: Error) => {
        const m: Result = {type: 'danger', msg: e.message};
        return of(m);
      })
    ).subscribe({
      next: (m: Result) => { 
        if (m.type === 'success') {
          this.updateEmail.reset();
        }
        this.message = m; 
      }
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
