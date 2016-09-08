import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-create-sub-form',
  template: `
    <baker-api-error [error]="error"></baker-api-error>
    <form [formGroup]="subCreateEmailForm" (ngSubmit)="onCreateEmailSubmit()">
      <div class="form-group">
        <label for="reason">Reason:</label>
        <input type="text" maxlength="50" class="form-control" formControlName="reason" placeholder="Reason (50 chars or less)">
      </div>
      <div class="form-group">
        <label for="message">Message:</label>
        <textarea class="form-control" rows="4" formControlName="message" placeholder="Message to send in email"></textarea>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-def btn-block">Email Request</button>
      </div>
    </form> 
  `
})
export class CreateSubForm {
  error: string;
  subCreateEmailForm: FormGroup;
  
  @Input() public patrolId: number = 0;
  @Output() public success = new EventEmitter();

  constructor(private _apiService: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.subCreateEmailForm = this._fb.group({
      reason: '',
      message: ''
    });
  }

  onCreateEmailSubmit() {
     this._apiService.createSubEmailRequest(this.patrolId, this.subCreateEmailForm.value).subscribe(
      success => this.success.emit(success),
      error => this.error = error
    );
  }
}
