import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-email-sub-form',
  template: `
    <baker-api-error [error]="error"></baker-api-error>
    <form [formGroup]="subEmailForm" (ngSubmit)="onEmailSubmit()">
      <div class="form-group">
        <label *ngIf="!subName" for="message">Message to group</label>
        <label *ngIf="subName" for="message">Message to {{subName}}</label>
        <textarea class="form-control" rows="4" formControlName="message" placeholder="Message to send in email"></textarea>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-def btn-block">{{buttonText}}</button>
      </div>
    </form>
  `
})
export class EmailSubForm {
  error: string;
  subEmailForm: FormGroup;
  
  @Input() public subName: string;
  @Input() public buttonText: string;
  @Input() public subId: number = 0;
  @Input() public reject: boolean = false;
  @Output() public success = new EventEmitter();

  constructor(private _apiService: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.subEmailForm = this._fb.group({
      message: ''
    });
  }

  onEmailSubmit() {
    if (!this.reject) {
      this._apiService.remindSubRequest(this.subId, this.subEmailForm.value).subscribe(
        success => this.success.emit(),
        error => this.error = error
      );
    } else {
      this._apiService.rejectSubRequest(this.subId, this.subEmailForm.value).subscribe(
      success => this.success.emit(),
      error => this.error = error
    );
    }
  }
}
