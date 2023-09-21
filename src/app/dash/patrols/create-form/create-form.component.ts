import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';
import { BakerApiService, SubAssignment } from 'src/app/shared/services/baker-api.service';
import { AssignmentSuccessEvent, FormSubmittedEvent } from '../../shared-forms/form-types';

@Component({
  selector: 'baker-create-sub-form',
  templateUrl: './create-form.component.html'
})
export class CreateFormComponent {
  public submitted: boolean = false;
  public error: string | null = null;
  public igear: IconDefinition = faGear;
  public createAndEmail: FormGroup = this._fb.group({
    reason: new FormControl(''), 
    message: new FormControl('')
  });

  @Input() public patrolId: number = 0;
  @Output() public create = new EventEmitter<FormSubmittedEvent | AssignmentSuccessEvent>();

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }

  submit() {
    this.submitted = true;
    this.create.emit({submitted: true});
    this._api.createSubEmailRequest(this.patrolId, this.createAndEmail.value).pipe(
      finalize(() => {
        this.submitted = false;
        this.create.emit({submitted: false});
      })
    ).subscribe({
      next: (s: SubAssignment) => this.create.emit({success: s}),
      error: (e: Error) => this.error = e.message
    });
  }

  clearError() {
    this.error = null;
  }

}
