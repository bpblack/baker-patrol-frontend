import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {BakerApiService} from '../services/baker-api.service';
import {validateIdSelection} from '../validations/validations';

@Component({
  selector: 'baker-create-assign-sub-form',
  template: `
    <baker-api-error [error]="error"></baker-api-error>
    <form *ngIf="assignables" [formGroup]="subCreateAssignForm" (ngSubmit)="onCreateEmailSubmit()">
      <div class="form-group">
        <label for="reason">Reason:</label>
        <input type="text" maxlength="50" class="form-control" formControlName="reason" placeholder="Reason (50 chars or less)">
      </div>
      <div *ngIf="assignables" class="form-group">
        <label for="message">Assign To:</label>
        <select formControlName="assigned_id">
          <option value="0" disabled selected>Please select a substitute</option>
          <option *ngFor="let assignable of assignables" value="{{assignable.id}}">{{assignable.name}}</option>
        </select>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-def btn-block" [disabled]="!subCreateAssignForm.valid">Create & Assign</button>
      </div>
    </form> 
  `
})
export class CreateAssignSubForm {
  error: string;
  subCreateAssignForm: FormGroup;
  assignables: Array<any>;
  
  @Input() public patrolId: number = 0;
  @Output() public success = new EventEmitter();

  constructor(private _apiService: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.subCreateAssignForm = this._fb.group({
      reason: '',
      assigned_id: [0, validateIdSelection]
    });

    this._apiService.getAssignableUsers(this.patrolId).subscribe(
      assignables => this.assignables = assignables,
      err => {}
    );
  }

  onCreateEmailSubmit() {
     this._apiService.createSubAssignRequest(this.patrolId, this.subCreateAssignForm.value).subscribe(
      success => this.success.emit(success),
      error => this.error = error
    );
  }
}
