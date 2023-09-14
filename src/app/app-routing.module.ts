import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { NoAuthGuard } from './shared/guards/no-auth.guard';
import { ResetComponent } from './reset/reset.component';

const routes: Routes = [
  { path: '', redirectTo: '/Login', pathMatch: 'full'},
  { path: 'Login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'Forgot', component: ForgotComponent, canActivate: [NoAuthGuard] },
  { path: 'Reset/:id', component: ResetComponent,  canActivate: [NoAuthGuard] },
  { path: 'Dash', loadChildren: () => import('./dash/dash.module').then(m => m.DashModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
