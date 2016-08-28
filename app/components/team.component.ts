import {Component, OnInit} from '@angular/core';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-patrol-team',
  templateUrl: 'app/views/team.component.html',
})

export class TeamComponent implements OnInit {
  team: Object;
  seasons: Array<any>;

  constructor(private _apiService: BakerApiService) {}

  ngOnInit() {
    //get the current user's seasons, then the team for the most recent season
    this._apiService.userSeasons().subscribe(
      success => { this.seasons = success; },
      err => {},
      () => {
        this._apiService.team(this.seasons[0].id).subscribe(
          success => { this.team = success; }
        );
      }
    );
  }

  get diagnostic() { return JSON.stringify(this.team); }

}

