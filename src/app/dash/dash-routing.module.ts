import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashComponent } from './dash/dash.component';
import { AuthGuard } from '../shared/guards/auth.guard';
import { PatrolsComponent } from './patrols/patrols.component';

const routes: Routes = [
  {
    path: '',
    component:DashComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: PatrolsComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashRoutingModule { }
