import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {BakerApiService} from '../services/baker-api.service';
import {validateIdSelection} from '../validations/validations';

@Component({
  selector: 'baker-assign-sub-form',
  template: `
    <baker-api-error *ngIf="!inline" [error]="_error"></baker-api-error>
    <form [formGroup]="subAssignForm" [ngClass]="{'form-inline': inline}" (ngSubmit)="onAssignSubmit()">
      <div *ngIf="assignables" class="form-group">
        <label *ngIf="!inline" for="substitute">Substitute</label>
        <select formControlName="assigned_id">
          <option *ngIf="!subUserId || subUserId == 0" value="0" disabled selected>Please select a substitute</option>
          <option *ngFor="let a of assignables" value="{{a.id}}">{{a.name}}</option>
        </select>
      </div>
      <div class="form-group">
        <button *ngIf="inline" type="submit" class="btn btn-primary btn-sm" [disabled]="!subAssignForm.valid || subAssignForm.controls.assigned_id.value == subUserId">
          <i class="glyphicon glyphicon-ok"></i>
        </button>
        <button *ngIf="!inline" type="submit" class="btn btn-def btn-block" [disabled]="!subAssignForm.valid || subAssignForm.controls.assigned_id.value == subUserId">Assign</button>
      </div>
    </form>
  `
})
export class AssignSubForm {
  _error: string;
  subAssignForm: FormGroup;
  assignables: Array<any>;
  
  @Input() public subId: number = 0;
  @Input() public patrolId: number = 0;
  @Input() public subName: string;
  @Input() public subUserId: number;
  @Input() public inline: boolean = false;
  @Output() public success = new EventEmitter();
  @Output() public error = new EventEmitter();

  constructor(private _apiService: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.subAssignForm = this._fb.group({
      assigned_id: [0, validateIdSelection]
    });

    if (this.subUserId == null) {
      this.subUserId = 0;
    }

    this._apiService.getAssignableUsers(this.patrolId).subscribe(
      assignables => this.assignables = assignables,
      error => {
        if (this.inline) {
          this.error.emit({error: error});
        } else {
          this._error = error;
        }
      },
      () => this.subAssignForm.controls['assigned_id'].setValue(this.subUserId)
    );
  }

  onAssignSubmit() {
    this._apiService.assignSubRequest(this.subId, this.subAssignForm.value).subscribe(
      success => this.success.emit(success),
      error => {
        if (this.inline) {
          this.error.emit({error: error});
        } else {
          this._error = error;
        }
      }
    );
  }
}

