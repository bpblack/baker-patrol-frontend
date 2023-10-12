import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FormSubmittedEvent, Substitute } from '../../shared/form-types';
import { BakerApiService } from 'src/app/shared/services/baker-api.service';
import { IconDefinition, faGear, faSleigh } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';

@Component({
  selector: 'baker-email-sub-form',
  templateUrl: './email-form.component.html'
})
export class EmailFormComponent {
  public submitted: boolean = false;
  public error: string | null = null;
  public igear: IconDefinition = faGear;
  public subEmail: FormGroup = this._fb.group({
    message: new FormControl('')
  })

  @Input() public buttonText: string;
  @Input() public sub: Substitute;
  @Input() public reject: boolean = false;
  @Output() public email = new EventEmitter<FormSubmittedEvent | boolean>();

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }

  onEmail() {
    this.submitted = true;
    this.email.emit({submitted: true});
    if (!this.reject) {
      this._api.remindSubRequest(this.sub.id, this.subEmail.value, ('sub_id' in this.sub) ? this.sub.sub_id : -1).pipe(
        finalize(() => {
          this.submitted = false;
          this.email.emit({submitted: false});
        })
      ).subscribe({
        next: (b: boolean) => this.email.emit(true),
        error: (e: Error) => this.error = e.message
      });
    } else {
      this._api.rejectSubRequest(this.sub.id, this.subEmail.value).pipe(
        finalize(() => {
          this.submitted = false;
          this.email.emit({submitted: false});
        })
      ).subscribe({
        next: (b: boolean) => this.email.emit(true),
        error: (e: Error) => this.error = e.message
      });
    }
  }

  clearError() {
    this.error = null;
  }
}
