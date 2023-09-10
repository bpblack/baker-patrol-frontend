import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { EMPTY, Observable, catchError, finalize } from 'rxjs';
import { BakerApiService, RosterUser } from 'src/app/shared/services/baker-api.service';
import { idSelectionValidator } from 'src/app/shared/validations/validations';

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
  @Output() public create = new EventEmitter();

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.createAssignForm = this._fb.group({
      reason: new FormControl(''),
      assigned_id: new FormControl(0, idSelectionValidator())
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
        this.create.emit({sub_id: +this.createAssignForm.value})
      }),
      catchError(e => {
        this.error = e.message;
        return EMPTY;
      })
    );
  }

  clearError() {
    this.error = null;
  }
}
