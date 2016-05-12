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

  constructor(private _apiService: BakerApiService, private _router: Router) {}

  ngOnInit() {
    //get the current user's team
    this._apiService.team().subscribe(
      success => { this.team = success }
      //error => {}  
    );
  }

  get diagnostic() { return JSON.stringify(this.team); }

}

