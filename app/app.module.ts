import {NgModule}                 from '@angular/core';
import {BrowserModule}            from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule, FormBuilder} from '@angular/forms';
import {Http, HttpModule}         from '@angular/http';
import {AuthHttp, AuthConfig}     from 'angular2-jwt';

import {routing, routeComponents, appRoutingProviders} from './app.routing';
import {AppComponent}     from './app.component';

import {IAuthService}    from './services/iauth.service';
import {BakerApiService} from './services/baker-api.service';

import {ModalModule, TabsModule} from 'ng2-bootstrap/ng2-bootstrap';
import {BakerApiError} from './components/error.component';
import {PatrolsTab} from './components/patrols_tab.component';
import {RequestsTab} from './components/requests_tab.component';
import {CreateSubForm} from './components/create_sub_form.component';
import {CreateAssignSubForm} from './components/create_assign_sub_form.component';
import {EmailSubForm} from './components/email_sub_form.component'
import {AssignSubForm} from './components/assign_sub_form.component';


@NgModule({
  imports:      [ BrowserModule, FormsModule, ReactiveFormsModule, HttpModule, TabsModule, ModalModule, routing ],
  declarations: [ 
    AppComponent, 
    BakerApiError,
    PatrolsTab, 
    RequestsTab, 
    CreateSubForm, 
    CreateAssignSubForm, 
    EmailSubForm, 
    AssignSubForm,
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
