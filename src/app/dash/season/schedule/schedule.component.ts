import { Component, OnInit } from '@angular/core';
import { IconDefinition, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Observable, concatMap } from 'rxjs';
import { BakerApiService, DutyDay, Season } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'baker-schedule',
  templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {
  public seasonName: string;
  public searchTerm: string = '';
  public dutyDays: Observable<DutyDay[]>;
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;

  constructor(private _api: BakerApiService) {}

  ngOnInit() {
    this.dutyDays = this._api.currentUserSeason.pipe(
      concatMap((s: Season) =>{
        this.seasonName = s.name;
        return this._api.getSeasonDutyDays(s.id);
      })
    );
  }
}
