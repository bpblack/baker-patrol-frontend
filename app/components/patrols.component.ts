import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router-deprecated';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-patrol-patrols',
  templateUrl: 'app/views/patrols.component.html',
  directives: [RouterLink]
})

export class PatrolsComponent implements OnInit {
  patrols: Array<Object>;
  seasons: Array<any>;

  constructor(private _apiService: BakerApiService, private _router: Router) {}

  ngOnInit() {
    //get the current user's seasons, then the patrols for the most recent season
    this._apiService.userSeasons().subscribe(
      success => { console.log("seasons"); this.seasons = success; },
      err => {},
      () => { 
        this._apiService.patrols(this.seasons[0].id).subscribe(
          success => { this.patrols = success; }
        );
      }
    );
  }

  get diagnostic() { return JSON.stringify({'patrols': this.patrols}); }

}


