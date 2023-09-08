import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashComponent } from './dash/dash.component';
import { AuthGuard } from '../shared/guards/auth.guard';
import { PatrolsComponent } from './patrols/patrols.component';
import { TeamComponent } from './team/team.component';
import { RosterComponent } from './roster/roster.component';
import { AccountComponent } from './account/account.component';
import { SeasonComponent } from './season/season.component';

const routes: Routes = [
  {
    path: '',
    component:DashComponent,
    canActivate: [AuthGuard],
    children: [{
      path: '',
      canActivateChild: [AuthGuard],
      children: [
        { path: '', component: PatrolsComponent},
        { path: 'Account', component: AccountComponent},
        { path: 'Roster', component: RosterComponent},
        { path: 'Season', component: SeasonComponent},
        { path: 'Team', component: TeamComponent},
      ]
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashRoutingModule { }
