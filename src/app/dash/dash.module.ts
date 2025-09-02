import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

import { AlertModule } from 'ngx-bootstrap/alert';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { DropzoneComponent, FileInputDirective } from '@ngx-dropzone/cdk';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DashRoutingModule } from './dash-routing.module';
import { DashComponent } from './dash/dash.component';

import { PatrolsComponent } from './patrols/patrols.component';
import { TeamComponent } from './team/team.component';
import { RosterComponent } from './roster/roster.component';
import { SearchRosterPipe } from './roster/roster-search.pipe';
import { SearchComponent } from './search/search.component';
import { DutyDayComponent } from './duty-day/duty-day.component';
import { ResponsibilitySwapFormComponent } from './duty-day/responsibility-swap-form/responsibility-swap-form.component';
import { PatrolsTabComponent } from './patrols/patrols-tab/patrols-tab.component';
import { RequestsTabComponent } from './patrols/requests-tab/requests-tab.component';
import { UpdateEmailComponent } from './account/update-email/update-email.component';
import { CreateFormComponent } from './patrols/create-form/create-form.component';
import { EmailFormComponent } from './patrols/email-form/email-form.component';
import { OpenTabComponent } from './patrols/open-tab/open-tab.component';

import { CreateAssignFormComponent } from './shared/create-assign-form/create-assign-form.component';
import { AssignFormComponent } from './shared/assign-form/assign-form.component';
import { BakerDropzone } from './shared/dropzone/dropzone.component';

import { AccountComponent } from './account/account.component';
import { UpdatePasswordComponent } from './account/update-password/update-password.component';
import { UpdateNameComponent } from './account/update-name/update-name.component';
import { UpdatePhoneComponent } from './account/update-phone/update-phone.component';
import { GoogleCalendarComponent } from './account/google-calendar/google-calendar.component';

import { CprClassesComponent } from './cpr/classes/cprclasses.component';
import { StudentsComponent } from './cpr/students/students.component';
import { SearchStudentsPipe } from './cpr/students/student-search.pipe';
import { CprSettingsComponent } from './cpr/settings/cprsettings.component';

import { ScheduleComponent } from './season/schedule/schedule.component';
import { SearchDutyDaysPipe } from './season/schedule/schedule-search.pipe';
import { AdminSettingsComponent } from './season/settings/admin-settings.component';
import { CprRefresherComponent } from './cpr/refresher/cpr-refresher.component';
import { CprSignupFormComponent } from '../cpr-signup/cpr-signup-form.component';

@NgModule({
  declarations: [
    DashComponent,
    PatrolsComponent,
    TeamComponent,
    RosterComponent,
    ScheduleComponent,
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
    OpenTabComponent,
    CprRefresherComponent,
    CprClassesComponent,
    SearchStudentsPipe,
    StudentsComponent,
    CprSettingsComponent,
    AdminSettingsComponent,
    BakerDropzone
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    FontAwesomeModule,
    DropzoneComponent,
    FileInputDirective,
    CprSignupFormComponent,
    DashRoutingModule
  ],
  providers: [provideNgxMask()]
})
export class DashModule { }
