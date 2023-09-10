import { Component } from '@angular/core';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { Observable, concatMap } from 'rxjs';
import { BakerApiService, Season } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'baker-team',
  templateUrl: './team.component.html'
})
export class TeamComponent {
  public igear: IconDefinition = faGear;
  public team: Observable<any>;

  constructor(private _api: BakerApiService) { }

  ngOnInit(): void {
    this.team = this._api.currentUserSeason.pipe(
      concatMap( (s: Season) => {
        return this._api.team(s.id);
      })
    );
  }
}
