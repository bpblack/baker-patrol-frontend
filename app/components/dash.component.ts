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
  constructor(private _apiService: BakerApiService, private _router: Router) {}

  ngOnInit() {
    this._apiService.userExtraClaims().subscribe( success => {})
  }

  userName() {
    return this._apiService.userName();
  }

  logout() {
    this._apiService.logout();
  }
}

