import {Component, provide, ViewContainerRef} from '@angular/core';
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
  viewContainerRef: ViewContainerRef;
  private jwtHelper: JwtHelper = new JwtHelper();

  constructor(private _apiService: BakerApiService, private _viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = _viewContainerRef;
  }

  get diagnostic() { return JSON.stringify({jwt: this._apiService.isLoggedIn() ? this.jwtHelper.decodeToken(localStorage.getItem('id_token')) : 'Not logged in'}); }
}
