import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DashRoutingModule } from './dash-routing.module';
import { DashComponent } from './dash/dash.component';
import { RouterModule } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PatrolsComponent } from './patrols/patrols.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TeamComponent } from './team/team.component';
import { RosterComponent } from './roster/roster.component';
import { SeasonComponent } from './season/season.component';
import { AccountComponent } from './account/account.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { SearchRosterPipe } from './roster/roster-search.pipe';
import { SearchComponent } from './search/search.component';
import { SearchDutyDaysPipe } from './season/season-search.pipe';

@NgModule({
  declarations: [
    DashComponent,
    PatrolsComponent,
    TeamComponent,
    RosterComponent,
    SeasonComponent,
    AccountComponent,
    SearchRosterPipe,
    SearchDutyDaysPipe,
    SearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    FontAwesomeModule,
    DashRoutingModule
  ]
})
export class DashModule { }
