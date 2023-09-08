import { Component } from '@angular/core';
import { IconDefinition, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { BakerApiService, DutyDay, Season } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.component.html'
})
export class SeasonComponent {
  public seasonName: string;
  public searchTerm: string;
  public dutyDays: Observable<DutyDay[]>;
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;

  constructor(private _apiService: BakerApiService) {}

  ngOnInit() {
    this._apiService.currentUserSeason.subscribe({
      next: (s: Season) =>{
        this.seasonName = s.name;
        this.dutyDays = this._apiService.getSeasonDutyDays(s.id);
      }
    });
  }
}
