import {Component, provide} from '@angular/core';
import {JwtHelper} from 'angular2-jwt';
import {BakerApiService} from './services/baker-api.service';

@Component({
  selector: 'baker-patrol-app',
  template: `
    <router-outlet></router-outlet>
    {{diagnostic}}
  `,
  providers: [BakerApiService]
})

export class AppComponent {

  private jwtHelper: JwtHelper = new JwtHelper();

  constructor(private _apiService: BakerApiService) {}

  get diagnostic() { return JSON.stringify({jwt: this._apiService.isLoggedIn() ? this.jwtHelper.decodeToken(localStorage.getItem('id_token')) : 'Not logged in'}); }
}
