import {Component, OnInit} from '@angular/core';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-patrol-dash',
  templateUrl: 'app/views/dash.component.html'
})

export class DashComponent implements OnInit {
  userName: string;
  userSeasons: Array<any>;
  userRoles: Array<any>;

  constructor(private _apiService: BakerApiService) {}

  ngOnInit() {
    this._apiService.userName().subscribe(
      success => this.userName = success
    );
    this._apiService.userSeasons().subscribe(
      success=> this.userSeasons = success
    );
    this._apiService.userRoles().subscribe(
      success=> this.userRoles = success
    );
  }

  logout() {
    this._apiService.logout();
  }

  get diagnostic() {
    return JSON.stringify({name: this.userName, seasons: this.userSeasons, roles: this.userRoles});
  }
}

