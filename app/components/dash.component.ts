import {Component, OnInit} from '@angular/core';
import {RouteConfig, Router, RouterLink} from '@angular/router-deprecated';
import {LoggedInRouterOutlet} from '../directives/logged-in-router-outlet.directive';
import {BakerApiService} from '../services/baker-api.service';
import {PatrolsComponent} from './patrols.component'
import {DutyDayComponent} from './duty_day.component'
import {TeamComponent} from './team.component'

@RouteConfig([
  { 
    path: "/Patrols",     
    name: "Patrols",     
    component: PatrolsComponent,
    useAsDefault: true,
    data: {roles: []}
  },
  { 
    path: "/DutyDay/:id",     
    name: "DutyDay",     
    component: DutyDayComponent,
    data: {roles: []}
  },
  { 
    path: "/Team",     
    name: "Team",     
    component: TeamComponent,
    data: {roles: []}
  }
])

@Component({
  selector: 'baker-patrol-dash',
  templateUrl: 'app/views/dash.component.html',
  directives: [LoggedInRouterOutlet, RouterLink]
})

export class DashComponent implements OnInit {
  userName: string;

  constructor(private _apiService: BakerApiService, private _router: Router) {}

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

