import {ModuleWithProviders}  from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {Http, HTTP_PROVIDERS} from '@angular/http';

import {AuthGuard} from './guards/auth.guard';
import {NoAuthGuard} from './guards/no-auth.guard';

import {LoginComponent}   from './components/login.component';
import {ForgotComponent}  from './components/forgot.component';
import {ResetComponent}   from './components/reset.component';
import {DashComponent}    from './components/dash.component';
import {PatrolsComponent} from './components/patrols.component';
import {DutyDayComponent} from './components/duty_day.component';
import {TeamComponent}    from './components/team.component';

const appRoutes: Routes = [
  { 
    path: 'Login', 
    component: LoginComponent,
    canActivate: [NoAuthGuard]  
  },
  {
    path: 'Forgot', 
    component: ForgotComponent,
    canActivate: [NoAuthGuard]  
  },
  { 
    path: 'Reset/:id',
    component: ResetComponent,
    canActivate: [NoAuthGuard]  
  },
  { 
    path: 'Dash', 
    component: DashComponent,
    canActivate: [AuthGuard], 
    children: [
      { path: '',
        redirectTo: '/Dash/Patrols',
        pathMatch: 'full'
      },
      {
        path: 'Patrols',
        component: PatrolsComponent
      },
      {
        path: 'DutyDay/:id',
        component: DutyDayComponent
      },
      {
        path: 'Team',
        component: TeamComponent
      }
    ]
  }];

export const routeComponents: any[] = [
  LoginComponent,
  ForgotComponent,
  ResetComponent,  
  DashComponent,
  PatrolsComponent,
  DutyDayComponent,
  TeamComponent
];

export const appRoutingProviders: any[] = [
  AuthGuard,
  NoAuthGuard
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
