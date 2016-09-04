import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {BakerApiService} from '../services/baker-api.service';
import {BakerApiError} from './error.component';

@Component({
  selector: 'baker-create-sub-form',
  directives: [FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, BakerApiError],
  template: `
    <baker-api-error [error]="error"></baker-api-error>
    <form [formGroup]="subCreateEmailForm" #f="ngForm" (ngSubmit)="onCreateEmailSubmit()">
      <div class="form-group">
        <label for="reason">Reason:</label>
        <input type="text" maxlength="50" class="form-control" [formControl]="subCreateEmailForm.controls['reason']" placeholder="Reason (50 chars or less)" #reason="ngForm">
      </div>
      <div class="form-group">
        <label for="message">Message:</label>
        <textarea class="form-control" rows="4" [formControl]="subCreateEmailForm.controls['message']" placeholder="Message to send in email" #message="ngForm"></textarea>
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
      success => this.success.emit(),
      error => this.error = error
    );
  }
}
