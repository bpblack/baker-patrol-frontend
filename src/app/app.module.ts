import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from  "@auth0/angular-jwt";
import { AlertModule } from 'ngx-bootstrap/alert';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashModule } from './dash/dash.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ResetComponent } from './reset/reset.component';
import { GoogleCalendarComponent } from './google-calendar/google-calendar.component';

export function tokenGetter() {
  return localStorage.getItem("id_token");
}

@NgModule({ 
    declarations: [
        AppComponent,
        LoginComponent,
        ForgotComponent,
        ResetComponent,
        GoogleCalendarComponent
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
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
    providers: [provideHttpClient(withInterceptorsFromDi())] 
})
export class AppModule { }
