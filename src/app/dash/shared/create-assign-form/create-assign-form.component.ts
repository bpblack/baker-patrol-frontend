import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { EMPTY, Observable, catchError, finalize } from 'rxjs';
import { BakerApiService, RosterUser, SubAssignment } from 'src/app/shared/services/baker-api.service';
import { idSelectionValidator } from 'src/app/shared/validations/validations';
import { AssignmentSuccessEvent, FormSubmittedEvent } from '../form-types';

@Component({
  selector: 'baker-create-assign-sub-form',
  templateUrl: './create-assign-form.component.html'
})
export class CreateAssignFormComponent {
  public error: string | null = null;
  public createAssignForm: FormGroup;
  public submitted: boolean = false;
  public assignables: Observable<RosterUser[]>;
  public igear: IconDefinition = faGear;

  @Input() public patrolId: number = 0;
  @Input() public allowEmpty: boolean = false;
  @Output() public create = new EventEmitter<FormSubmittedEvent | AssignmentSuccessEvent>();

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.createAssignForm = this._fb.group({
      reason: new FormControl(''),
      assigned_id: new FormControl(0, this.allowEmpty ? null : idSelectionValidator())
    });

    this.assignables = this._api.getAssignableUsers(this.patrolId).pipe(
      catchError((e) => {this.error = e.message; return EMPTY;})
    );
  }

  onCreateEmailSubmit() {
    this.submitted = true;
    this.create.emit({submitted: true});
    this._api.createSubAssignRequest(this.patrolId, this.createAssignForm.value).pipe(
      finalize(() => {
        this.submitted = false;
        this.create.emit({submitted: false})
      })
    ).subscribe({
      next: (s: SubAssignment) => this.create.emit({success: s}),
      error: (e: Error) => this.error = e.message
    });
  }

  clearError() {
    this.error = null;
  }

  get defaultOption() {
    return this.allowEmpty ? "Assign to no one" : "Please select a substitute";
  }
}
