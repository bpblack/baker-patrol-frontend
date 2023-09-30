import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { finalize} from 'rxjs';
import { BakerApiService, Google, GoogleAuth } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

interface Result {
  type: string;
  msg: string;
}

function validateSelectionNotNull(g: Google | null): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const cval = c.value;
    if (cval === '') {
      return {valid: false};
    }
    if (g !== null && cval === g.current) {
      return {valid: false};
    }
    return null; 
  }
}

@Component({
  selector: 'baker-google-calendar-manage',
  templateUrl: './google-calendar.component.html'
})
export class GoogleCalendarComponent {
  public added: boolean = false;
  public changed: boolean = false;
  public removed: boolean = false;
  public initialized: boolean = false;
  public message: Result | null = null;
  public google: Google | null = null;
  public igear: IconDefinition = faGear;
  public updateCalendar: FormGroup;
  @Input() email: string = '';

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }

  ngOnInit() {
    this._api.getGoogleCalendar().pipe(
      finalize(() => this.initialized = true )
    ).subscribe({
      next: (g: Google | null) => {
        this.google = g;
        this.updateCalendar = this._fb.group({
          calendar_id: new FormControl('', validateSelectionNotNull(this.google))  
        })
        if (this.google !== null) {
          if (this.google.current === null) {
            this.google.current = '';
            this.google.calendars.unshift({name: 'Please select a calendar', id: ''});
          } else {
            this.updateCalendar.controls['calendar_id'].setValue(this.google.current);
          }
        }
      }, 
      error: (e: Error) => this.message = {type: 'danger', msg: e.message}
    });
  }

  onSubmit() {
    this.changed = true;
    this._api.selectGoogleCalendar(this.updateCalendar.value).pipe(
      finalize(() => this.changed = false)
    ).subscribe({
      next: (b: boolean) => {
        if (this.google) {
          this.google.current = this.updateCalendar.controls['calendar_id'].value;
        }
      },
      error: (e: Error) => this.message = {type: 'danger', msg: e.message}
    })
  }

  addCalendar() {
    this.added = true;
    this._api.authorizeGoogleCalendar().pipe(
      finalize(() => this.added = false)
    ).subscribe({
      next: (auth: GoogleAuth) => window.open(auth.uri, '_blank'),
      error: (e: Error) => this.message = {type: 'danger', msg: e.message}
    })
  }

  removeCalendar() {
    this.removed = true;
    this._api.removeGoogleCalendar().pipe(
      finalize(() => this.removed = false)
    ).subscribe({
      next: (b: boolean) => this.google = null,
      error: (e: Error) => this.message = {type: 'danger', msg: e.message}
    })
  }

  styleControl() {
    return styleControl(this.updateCalendar.controls['calendar_id']);
  }

  validSelection() {
    return this.updateCalendar.controls['calendar_id'].valid
  }
}
