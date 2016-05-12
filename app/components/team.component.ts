import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router-deprecated';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-patrol-team',
  templateUrl: 'app/views/team.component.html',
  directives: [RouterLink]
})

export class TeamComponent implements OnInit {
  team: Object;
  seasons: Array<any>;

  constructor(private _apiService: BakerApiService, private _router: Router) {}

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

