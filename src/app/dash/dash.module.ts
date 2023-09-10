import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DashRoutingModule } from './dash-routing.module';
import { DashComponent } from './dash/dash.component';
import { RouterModule } from '@angular/router';

import { AlertModule } from 'ngx-bootstrap/alert';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { PatrolsComponent } from './patrols/patrols.component';
import { TeamComponent } from './team/team.component';
import { RosterComponent } from './roster/roster.component';
import { SeasonComponent } from './season/season.component';
import { AccountComponent } from './account/account.component';
import { SearchRosterPipe } from './roster/roster-search.pipe';
import { SearchComponent } from './search/search.component';
import { SearchDutyDaysPipe } from './season/season-search.pipe';
import { DutyDayComponent } from './duty-day/duty-day.component';
import { ResponsibilitySwapFormComponent } from './duty-day/responsibility-swap-form/responsibility-swap-form.component';

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
    SearchComponent,
    DutyDayComponent,
    ResponsibilitySwapFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    FontAwesomeModule,
    DashRoutingModule
  ]
})
export class DashModule { }
