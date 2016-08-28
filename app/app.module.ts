import {NgModule}                 from '@angular/core';
import {BrowserModule}            from '@angular/platform-browser';
import {FormsModule, FormBuilder} from '@angular/forms';
import {Http, HttpModule}         from '@angular/http';
import {AuthHttp, AuthConfig}     from 'angular2-jwt';

import {routing, routeComponents, appRoutingProviders} from './app.routing';
import {AppComponent}     from './app.component';

import {IAuthService}    from './services/iauth.service';
import {BakerApiService} from './services/baker-api.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule, routing ],
  declarations: [ 
    AppComponent, 
    routeComponents
  ],
  providers:    [ 
    appRoutingProviders,
    BakerApiService,
    {provide: IAuthService, useClass: BakerApiService},
    FormBuilder,
    {
    provide: AuthHttp, 
    useFactory: (http) => {
      return new AuthHttp(
        new AuthConfig({
          headerName: 'Authorization',
          headerPrefix: 'Bearer',
          tokenName: 'token',
          tokenGetter: (() => localStorage.getItem('id_token')),
          globalHeaders: [{'Content-Type': 'application/json'}],
          noJwtError: false,
          noTokenScheme: false
        }),
        http
      );
      },
      deps: [Http]
    }
  ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
