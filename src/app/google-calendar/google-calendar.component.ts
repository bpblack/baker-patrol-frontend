import { Component } from '@angular/core';
import { BakerApiService, Google } from '../shared/services/baker-api.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, concatMap, finalize } from 'rxjs';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'baker-google-calendar',
    templateUrl: './google-calendar.component.html',
    standalone: false
})
export class GoogleCalendarComponent {
  public error: string;
  public igear: IconDefinition = faGear;

  constructor(private _api: BakerApiService, private _router: Router, private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.queryParams.pipe(
      concatMap((params: Params) => {
        if (params['code']) {
          return this._api.createGoogleCalendar(params['code'])
        } else {
          return EMPTY;
        }
      })
    ).subscribe({
      next: (res) => this.returnToAccount(),
      error: (e: Error) => this.error = e.message
    })
  }

  returnToAccount() {
    this._router.navigate(['/Dash/Account']);
  }

}
