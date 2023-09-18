import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faAt, faGear } from '@fortawesome/free-solid-svg-icons';
import { BakerApiService } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'baker-google-calendar',
  templateUrl: './google-calendar.component.html'
})
export class GoogleCalendarComponent {
  public submitted: boolean = false;
  public error: string | null = null;
  public iat: IconDefinition = faAt;
  public igear: IconDefinition = faGear;
  public form: FormGroup = this._fb.group({
    email: new FormControl('', Validators.compose([Validators.required, Validators.email, ]))
  })
  @Input() email: string = '';

  constructor(private _api: BakerApiService, private _fb: FormBuilder) { }
}
