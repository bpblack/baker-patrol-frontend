import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from  "@auth0/angular-jwt";
import { AlertModule } from 'ngx-bootstrap/alert';

import { BakerApiService } from './shared/services/baker-api.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashModule } from './dash/dash.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ResetComponent } from './reset/reset.component';

export function tokenGetter() {
  return localStorage.getItem("id_token");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgotComponent,
    ResetComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: environment.allowedDomains,
      },
    }),
    AlertModule.forRoot(),
    FontAwesomeModule,
    DashModule
  ],
  providers: [BakerApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
