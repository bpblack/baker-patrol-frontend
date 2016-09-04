import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {BakerApiService} from '../services/baker-api.service';
import {validateIdSelection} from '../validations/validations';
import {BakerApiError} from './error.component';

@Component({
  selector: 'baker-assign-sub-form',
  directives: [FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, BakerApiError],
  template: `
    <baker-api-error [error]="error"></baker-api-error>
    <form [formGroup]="subAssignForm" #f="ngForm" (ngSubmit)="onAssignSubmit()">
      <div *ngIf="assignables" class="form-group">
        <label for="substitute">Substitute</label>
        <select [formControl]="subAssignForm.controls['assigned_id']" #assigned_id="ngForm">
          <option *ngIf="!subName" value="0" disabled selected>Please select a substitute</option>
          <option *ngFor="let assignable of assignables" value="{{assignable.id}}">{{assignable.name}}</option>
        </select>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-def btn-block" [disabled]="!subAssignForm.valid || subAssignForm.controls['assigned_id'].value == subUserId">Assign</button>
      </div>
    </form>
  `
})
export class AssignSubForm {
  error: string;
  subAssignForm: FormGroup;
  assignables: Array<any>;
  
  @Input() public subId: number = 0;
  @Input() public patrolId: number = 0;
  @Input() public subName: string;
  @Input() public subUserId: number = 0;
  @Output() public success = new EventEmitter();

  constructor(private _apiService: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.subAssignForm = this._fb.group({
      assigned_id: [0, validateIdSelection]
    });

    this.subUserId = this.subUserId ? this.subUserId : 0;
    console.log(this.patrolId + ' ' + this.subId + ' ' + this.subName + ' ' + this.subUserId);
    this._apiService.getAssignableUsers(this.patrolId).subscribe(
      assignables => this.assignables = assignables,
      err => {},
      () => this.subAssignForm.controls['assigned_id'].setValue(this.subUserId)
    );
  }

  onAssignSubmit() {
    this._apiService.assignSubRequest(this.subId, this.subAssignForm.value).subscribe(
      success => this.success.emit(),
      error => this.error = error
    );
  }
}

