import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashComponent } from './dash/dash.component';
import { AuthGuard } from '../shared/guards/auth.guard';
import { PatrolsComponent } from './patrols/patrols.component';
import { TeamComponent } from './team/team.component';
import { RosterComponent } from './roster/roster.component';
import { AccountComponent } from './account/account.component';
import { SeasonComponent } from './season/season.component';
import { DutyDayComponent } from './duty-day/duty-day.component';
import { CprClassesComponent } from './cpr/classes/cprclasses.component';
import { StudentsComponent } from './cpr/students/students.component';
import { GetRoleGuard } from '../shared/guards/roles.guard';
import { CprSettingsComponent } from './cpr/settings/cprsettings.component';

const routes: Routes = [
  {
    path: '',
    component:DashComponent,
    canActivate: [AuthGuard],
    children: [{
      path: '',
      canActivateChild: [AuthGuard],
      children: [
        { path: '', redirectTo: 'Patrols', pathMatch: 'full'},
        { path: 'Patrols', component: PatrolsComponent },
        { path: 'Account', component: AccountComponent },
        { path: 'DutyDay/:id', component: DutyDayComponent },
        { path: 'Roster', component: RosterComponent },
        { path: 'Season', component: SeasonComponent, canActivate: [GetRoleGuard(new Set<string>(['admin', 'leader']))] },
        { path: 'Team', component: TeamComponent }
      ]
    },
    {
      path: 'Cpr',
      canActivateChild: [AuthGuard],
      children: [
        { path: 'Classes', component: CprClassesComponent, canActivate: [GetRoleGuard(new Set<string>(['admin', 'cprior', 'cprinstructor']))] },
        { path: 'Students', component: StudentsComponent, canActivate: [GetRoleGuard(new Set<string>(['admin', 'cprior', 'cprinstructor']))] },
        { path: 'Settings', component: CprSettingsComponent, canActivate: [GetRoleGuard(new Set<string>(['admin', 'cprior']))] }
      ]
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashRoutingModule { }
