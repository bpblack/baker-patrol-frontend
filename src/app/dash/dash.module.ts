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
import { CreateAssignFormComponent } from './shared-forms/create-assign-form/create-assign-form.component';
import { AssignFormComponent } from './shared-forms/assign-form/assign-form.component';
import { PatrolsTabComponent } from './patrols/patrols-tab/patrols-tab.component';
import { RequestsTabComponent } from './patrols/requests-tab/requests-tab.component';
import { UpdateEmailComponent } from './account/update-email/update-email.component';
import { UpdatePasswordComponent } from './account/update-password/update-password.component';
import { UpdateNameComponent } from './account/update-name/update-name.component';
import { UpdatePhoneComponent } from './account/update-phone/update-phone.component';
import { GoogleCalendarComponent } from './account/google-calendar/google-calendar.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { CreateFormComponent } from './patrols/create-form/create-form.component';
import { EmailFormComponent } from './patrols/email-form/email-form.component';
import { OpenTabComponent } from './patrols/open-tab/open-tab.component';

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
    ResponsibilitySwapFormComponent,
    CreateAssignFormComponent,
    AssignFormComponent,
    PatrolsTabComponent,
    RequestsTabComponent,
    UpdateEmailComponent,
    UpdatePasswordComponent,
    UpdateNameComponent,
    UpdatePhoneComponent,
    GoogleCalendarComponent,
    CreateFormComponent,
    EmailFormComponent,
    OpenTabComponent
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
    NgxMaskDirective,
    NgxMaskPipe,
    FontAwesomeModule,
    DashRoutingModule
  ],
  providers: [provideNgxMask()]
})
export class DashModule { }
