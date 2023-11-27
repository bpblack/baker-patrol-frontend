import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IconDefinition, faCheck, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Observable, catchError, finalize, of, EMPTY} from 'rxjs';
import { BakerApiService, RosterUser, SubAssignment } from 'src/app/shared/services/baker-api.service';
import { idSelectionValidator } from 'src/app/shared/validations/validations';
import { AssignmentSuccessEvent, FormSubmittedEvent } from '../form-types';

interface Substitute {
  id: number;
  sub_id: number;
  sub_name: string;
}

@Component({
  selector: 'baker-assign-sub-form',
  templateUrl: './assign-form.component.html'
})

export class AssignFormComponent {
  public error: string | null = null;
  public assignForm: FormGroup;
  public submitted: boolean = false;
  public deleted: boolean = false;
  public assignables: RosterUser[];
  public igear: IconDefinition = faGear;
  public icheck: IconDefinition = faCheck;
  public ixmark: IconDefinition = faXmark;

  @Input() public patrolId: number = 0;
  @Input() public sub: Substitute;
  @Input() public inline: boolean = false;
  @Output() public assign = new EventEmitter<AssignmentSuccessEvent | FormSubmittedEvent | string>();

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    if (this.sub === undefined) {
      this.sub = {id: 0, sub_id: 0, sub_name: 'No One'};
    } else if (!this.sub.sub_id || this.sub.sub_id < 1) {
      this.sub.sub_id = 0;
      this.sub.sub_name = 'No One';
    }
    this.assignForm = this._fb.group({
      assigned_id: new FormControl(this.sub.sub_id, this.inline ? null : idSelectionValidator())
    });
    this._api.getAssignableUsers(this.patrolId).subscribe({
      next: (rus: RosterUser[]) => {
        this.assignables = rus;
        if (this.inline) {
          this.assignables.unshift({id: 0, name: 'Assign to no one'});
          if (this.sub.sub_id > 0) {
            this.assignables.unshift({id: this.sub.sub_id, name: this.sub.sub_name})
          }
        } else if (this.sub.sub_id === 0) {
          this.assignables.unshift({id: 0, name: 'Please select a substitute'})
        } else {
          this.assignables.unshift({id: this.sub.sub_id, name: this.sub.sub_name})
        }
      },
      error: (e: Error) => this.error = e.message
    });
  }

  onAssignSubmit() {
    this.submitted = true;
    if (!this.inline) {
      this.assign.emit({submitted: true});
    }
    this._api.assignSubRequest(this.sub.id, this.assignForm.value).pipe(
      finalize(() => {
        this.submitted = false;
        if (!this.inline) {
          this.assign.emit({submitted: false});
        }
      })
    ).subscribe({
      next: (s: SubAssignment) => this.assign.emit({success: s}),
      error: (e: Error) => {
        if (this.inline) {
          this.assign.emit(e.message);
        } else {
          this.error = e.message;
        }
      }
    })
  }

  deleteSub() {
    if (this.inline) {
      this.deleted = true;
      this._api.deleteSubRequest(this.sub.id).pipe(
        finalize(() => this.deleted = false)
      ).subscribe({
        next: (b: boolean) => this.assign.emit({success: null}),
        error: (e: Error) => this.assign.emit(e.message)
      });
    }
  }

  clearError() {
    this.error = null;
  }

  get disableSubmit() {
    return this.assignForm.invalid || +this.assignForm.controls['assigned_id'].value === this.sub.sub_id;
  }

  get loadingMessage() {
    return this.inline ? 'Loading...' : 'Loading assignable users...';
  }
}
