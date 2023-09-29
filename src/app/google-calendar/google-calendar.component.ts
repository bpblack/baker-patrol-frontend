import { Component } from '@angular/core';
import { BakerApiService, Google } from '../shared/services/baker-api.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, concatMap, finalize } from 'rxjs';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'baker-google-calendar',
  templateUrl: './google-calendar.component.html'
})
export class GoogleCalendarComponent {
  public igear: IconDefinition = faGear;

  constructor(private _api: BakerApiService, private _router: Router, private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.queryParams.pipe(
      concatMap((params: Params) => {
        if (params['code']) {
          return this._api.createGoogleCalendar(params['code'])
        }
        return EMPTY;
      })
    ).pipe(
      finalize(() => this._router.navigate(['/Dash/Account']))
    )
  }

}
