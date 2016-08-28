import {Component, OnInit} from '@angular/core';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-patrol-dash',
  templateUrl: 'app/views/dash.component.html'
})

export class DashComponent implements OnInit {
  userName: string;

  constructor(private _apiService: BakerApiService) {}

  ngOnInit() {
    this._apiService.userName().subscribe(
      success => this.userName = success
    );
  }

  logout() {
    this._apiService.logout();
  }

  get diagnostic() {
    let seasons: Array<any>;
    this._apiService.userSeasons().subscribe(
      success => seasons = success
    );
    return JSON.stringify({name: this.userName, seasons: seasons});
  }
}

