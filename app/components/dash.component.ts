import {Component} from '@angular/core';
import {RouteConfig, Router, RouterLink} from '@angular/router-deprecated';
import {BakerApiService} from '../services/baker-api.service';

/*@RouteConfig([
  { 
    path: "/Patrols",     
    name: "Patrols",     
    component: PatrolsComponent,
    useAsDefault: true,
    data: {roles: []}
  }
])*/

@Component({
  selector: 'baker-patrol-dash',
  templateUrl: 'app/views/dash.component.html',
  directives: [RouterLink]
})

export class DashComponent {
  constructor(private _apiService: BakerApiService, private _router: Router) {}
    
  logout() {
    this._apiService.logout();
  }
}

