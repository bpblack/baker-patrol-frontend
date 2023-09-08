import { Component } from '@angular/core';
import { IconDefinition, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Observable, map } from 'rxjs';
import { BakerApiService, Season, TeamRoster } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html'
})
export class RosterComponent {
  public error: string;
  public searchTerm: string = '';
  public season_name: string;
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;
  public roster: Observable<TeamRoster[]>;

  constructor(private _apiService: BakerApiService) { }

  ngOnInit() {
    this._apiService.currentUserSeason.subscribe({
      next: (s: Season) => {
        this.season_name = s.name;
        this.roster = this._apiService.getSeasonRoster(s.id);
      }
    });
  }
}
