import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FileInputValidators } from '@ngx-dropzone/cdk';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, finalize } from 'rxjs';
import { BakerApiService, Season } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';
import { environment } from 'src/environments/environment';

const validStart: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const now = new Date();
  const v: Date | null = c.value;
  return (!v || v.getMonth() !== 10 ||v.getDay() !== 5 || v.getFullYear() !== now.getFullYear()) ? { invalidStart: true } : null;
} 

const validEnd: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const now = new Date();
  const v: Date | null = c.value;
  return (!v || v.getMonth() !== 3 || v.getDay() !== 0 || v.getFullYear() !== now.getFullYear() + 1) ? { invalidEnd: true } : null;
}

const validLength: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const s = c.get('start')!.value;
  const e = c.get('end')!.value;
  if (s && e) {
    const ndays = Math.round((e.getTime() - s.getTime())/(24*3600*1000)) + 1;
    if (Math.floor((s.getDay() + ndays)/7) !== environment.numWeekends){
      return {invalidLength: true};
    }
  }
  return null;
}

@Component({
  selector: 'baker-season-admin-settings',
  templateUrl: './admin-settings.component.html'
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  public latest: Season;
  public setupSub: Subscription;
  public endMonth: Date[] = [];
  public startMonth: Date[] = [];
  public today: Date = new Date();
  public initConfirm: boolean = false;
  public emailCount: number | null = null;
  public setupErrors = {start: '', end: '', season: '', roster: '', api: ''};
  public disableClose = {initialize: false, emailed: false};
  public icons = {gear: faGear, ok: faCircleCheck, tri: faTriangleExclamation};
  public dateConfig = {containerClass: 'theme-dark-blue', withTimepicker: true, keepDatepickerOpened: true, dateInputFormat: 'MM/DD/YYYY' };

  public seasonSetupForm = this._fb.group({
    start: new FormControl<Date | null>(null, [Validators.required, validStart]),
    end: new FormControl<Date | null>(null, [Validators.required, validEnd]),
    team: new FormControl<string>('', [Validators.required]),
    roster: new FormControl<File | null>(null, [Validators.required, FileInputValidators.accept('application/json')])
  }, {validators: validLength});

  @ViewChild('initializeSeason') initializeModal: any;
  private _initializeRef: BsModalRef;

  @ViewChild('emailNewUsers') emailNewUserModal: any;
  private _emailNewUserRef: BsModalRef;

  private _modalConfig =  {animated: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-lg'};

  constructor(private _api: BakerApiService, private _fb: FormBuilder, private _modal: BsModalService) { 
    this.startMonth.push(new Date(this.today.getFullYear(), 10, 1));
    this.startMonth.push(new Date(this.today.getFullYear(), 10, 30));
    this.endMonth.push(new Date(this.today.getFullYear() + 1, 3, 1));
    this.endMonth.push(new Date(this.today.getFullYear() + 1, 3, 30))
  }

  ngOnInit() {
    this._api.getLatestSeason().subscribe({
      next: (s: Season) => this.latest = s
    });

    this.setupSub = this.seasonSetupForm.valueChanges.subscribe(c => {
      if (c.start) {
        this.setupErrors.start = '';
        if (this.seasonSetupForm.controls['start'].errors?.['invalidStart']) {
          this.setupErrors.start = 'The starting date must be a Friday in November ' + this.startMonth[0].getFullYear() + '.';
        }
      }
      if (c.end) {
        this.setupErrors.end = '';
        if (this.seasonSetupForm.controls['end'].errors?.['invalidEnd']) {
          this.setupErrors.end = 'The ending date must be a Sunday in April ' + this.endMonth[0].getFullYear() + '.';
        }
      }
      if (c.start && c.end) {
        this.setupErrors.season = '';
        if (this.seasonSetupForm.errors?.['invalidLength']) {
          this.setupErrors.season = 'The season must have ' + environment.numWeekends + ' weekends.';
        }
      }
      if (c.roster) {
        this.setupErrors.roster = ''
        if (this.seasonSetupForm.controls['roster'].errors?.['accept']) {
          this._api.log('roster error');
          this.setupErrors.roster = 'The uploaded file must be a *.json file.';
        }
      }
    });
  }

  ngOnDestroy() {
    this.setupSub.unsubscribe();
  }

  styleControl(ac: AbstractControl) {
    return styleControl(ac);
  }

  get end(): Date {
    const e = new Date(this.latest.end);
    const tzstrip = new Date(e.getFullYear(), e.getMonth(), e.getUTCDate());
    return new Date(tzstrip);
  }

  get fileName(): string | null {
    const f: File | null = this.seasonSetupForm.controls['roster'].value;
    return f ? f.name : null;
  }

  onInitializeSubmit() {
    this._initializeRef = this._modal.show(this.initializeModal, this._modalConfig);
  }

  hideInitialize() {
    this._initializeRef.hide();
    this.initConfirm = false;
    this.clearApiError();
  }
  
  clearApiError() {
    this.setupErrors.api = '';
  }

  onInitializeConfirmSubmit() {
    this.disableClose.initialize = true;
    this._api.addSeason(this.seasonSetupForm.getRawValue()).pipe(
      finalize(() => this.disableClose.initialize = false)
    ).subscribe({
      next: (s: Season) => {
        this.latest = s;
        this.seasonSetupForm.reset();
        this.hideInitialize();
      },
      error: (e: Error) => this.setupErrors.api = e.message
    });
  }

  showEmailNewUsers() {
    this._emailNewUserRef = this._modal.show(this.emailNewUserModal, this._modalConfig);
  }

  hideEmailNewUsers() {
    this._emailNewUserRef.hide();
    this.clearApiError();
    this.clearEmailCount();
  }

  onEmailNewUsers() {
    this.disableClose.emailed = true;
    this._api.sendNewUserPasswordResets().pipe(
      finalize(() => this.disableClose.emailed = false)
    ).subscribe({
      next: (c: number) => this.emailCount = c,
      error: (e: Error) => this.setupErrors.api = e.message
    });
  }

  clearEmailCount() {
    this.emailCount = null;
  }
}
