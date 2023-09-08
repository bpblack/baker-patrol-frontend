import { Component } from '@angular/core';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { BakerApiService, Season } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html'
})
export class TeamComponent {
  public igear: IconDefinition = faGear;
  public team: Observable<any>;

  constructor(private _apiService: BakerApiService) { }

  ngOnInit(): void {
    this._apiService.currentUserSeason.subscribe({
      next: (s: Season) => {
        if (s.name) {
          this.team = this._apiService.team(s.id);
        }
      }
    });
  }

}
