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
  public assignables: Observable<RosterUser[]>;
  public igear: IconDefinition = faGear;
  public icheck: IconDefinition = faCheck;
  public ixmark: IconDefinition = faXmark;

  @Input() public patrolId: number = 0;
  @Input() public sub: Substitute;
  @Input() public inline: boolean = false;
  @Output() public assign = new EventEmitter<AssignmentSuccessEvent | FormSubmittedEvent>();

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.assignForm = this._fb.group({
      assigned_id: new FormControl(0, this.inline ? null : idSelectionValidator())
    });
    if (this.sub === undefined) {
      this.sub = {id: 0, sub_id: 0, sub_name: 'No One'};
    } else if (!this.sub.sub_id || this.sub.sub_id < 1) {
      this.sub.sub_id = 0;
      this.sub.sub_name = 'No One';
    }
    this.assignables = this._api.getAssignableUsers(this.patrolId).pipe(
      catchError((e) => {this.error = e.message; return EMPTY;})
    );
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
      error: (e: Error) => this.error = e.message
    })
  }

  clearError() {
    this.error = null;
  }

  loadingMessage() {
    if (this.inline) {
      return 'Loading...';
    }
    return 'Loading assignable users...';
  }
}
