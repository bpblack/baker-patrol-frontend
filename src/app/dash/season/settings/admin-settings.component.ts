import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FileInputValidators } from '@ngx-dropzone/cdk';
import { Subscription } from 'rxjs';
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
  console.log('Valid length?', s, e)
  if (s && c) {
    const ndays = Math.round((e.getTime() - s.getTime())/(24*3600*1000));
    console.log("Number of weekends is", Math.floor((s.getDay() + ndays)/7));
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
  public endMonth: Date[] = [];
  public startMonth: Date[] = [];
  public today: Date = new Date();
  public errors = {setup: <string[]>[]};
  public setupSub: Subscription;
  public icons = {gear: faGear, triangle: faTriangleExclamation};
  public dateConfig = {containerClass: 'theme-dark-blue', withTimepicker: true, keepDatepickerOpened: true, dateInputFormat: 'MM/DD/YYYY' };
  public seasonSetupForm = this._fb.group({
    start: new FormControl<Date | null>(null, [Validators.required, validStart]),
    end: new FormControl<Date | null>(null, [Validators.required, validEnd]),
    file: new FormControl<File | null>(null, [Validators.required, FileInputValidators.accept('application/json')])
  }, {validators: validLength});

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { 
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
      this.errors.setup = [];
      this._api.log("Change is", c);
      if (c.start && this.seasonSetupForm.controls['start'].errors?.['invalidStart']) {
        this.errors.setup.push('The starting date must be a Friday in November ' + this.startMonth[0].getFullYear() + '.');
      }
      if (c.end && this.seasonSetupForm.controls['end'].errors?.['invalidEnd']) {
        this.errors.setup.push('The ending date must be a Sunday in April ' + this.endMonth[0].getFullYear() + '.');
      }
      if (c.start && c.end && this.seasonSetupForm.errors?.['invalidLength']) {
        this.errors.setup.push('The season must have ' + environment.numWeekends + ' weekends.');
      }
      if (c.file && this.seasonSetupForm.controls['file'].errors?.['accept']) {
        this.errors.setup.push('The uploaded file must be a *.json file.');
      }
    });
  }

  ngOnDestroy() {
    this.setupSub.unsubscribe();
  }

  onSetupSubmit() {
    
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
    const f: File | null = this.seasonSetupForm.controls['file'].value;
    return f ? f.name : null;
  }

}
