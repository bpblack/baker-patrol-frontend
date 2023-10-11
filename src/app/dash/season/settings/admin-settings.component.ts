import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FileInputValidators } from '@ngx-dropzone/cdk';
import { BakerApiService, Season } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

@Component({
  selector: 'baker-season-admin-settings',
  templateUrl: './admin-settings.component.html'
})
export class AdminSettingsComponent implements OnInit {
  public latest: Season;
  public icons = {gear: faGear, triangle: faTriangleExclamation};
  public dateConfig = {withTimepicker: true, keepDatepickerOpened: true, dateInputFormat: 'MM/DD/YYYY' };
  public seasonSetupForm = this._fb.group({
    start: new FormControl<Date | null>(null, [Validators.required]),
    end: new FormControl<Date | null>(null, [Validators.required]),
    file: new FormControl<File | null>(null, [Validators.required, FileInputValidators.accept('application/json')])
  })

  ngOnInit() {
    this._api.getLatestSeason().subscribe({
      next: (s: Season) => this.latest = s
    });
  }

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }

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

  get now(): Date {
    return new Date(Date.now());
  }

  get fileName(): string | null {
    const f: File | null = this.seasonSetupForm.controls['file'].value;
    return f ? f.name : null;
  }

}
