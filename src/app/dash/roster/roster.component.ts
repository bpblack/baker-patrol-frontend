import { Component } from '@angular/core';
import { IconDefinition, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Observable, concatMap} from 'rxjs';
import { BakerApiService, Season, TeamRoster } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'baker-roster',
  templateUrl: './roster.component.html'
})
export class RosterComponent {
  public searchTerm: string = '';
  public seasonName: string;
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;
  public roster: Observable<TeamRoster[]>;

  constructor(private _api: BakerApiService) { }

  ngOnInit() {
    this.roster = this._api.currentUserSeason.pipe(
      concatMap((s: Season) => {
        this.seasonName = s.name;
        return this._api.getSeasonRoster(s.id)
      })
    );
  }
}
