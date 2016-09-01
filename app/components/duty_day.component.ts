import {Component, OnInit, ViewChild} from '@angular/core';
import {CORE_DIRECTIVES}   from '@angular/common';
import {ActivatedRoute, Params} from '@angular/router';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup} from '@angular/forms';
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS, ModalDirective, TAB_DIRECTIVES, TabDirective, TabsetComponent} from 'ng2-bootstrap/ng2-bootstrap';
import {BakerApiService} from '../services/baker-api.service';
import {validateIdSelection} from '../validations/validations';
import {BakerApiError} from './error.component';

@Component({
  selector: 'baker-patrol-duty-day',
  templateUrl: 'app/views/duty_day.component.html',
  directives: [MODAL_DIRECTIVES, CORE_DIRECTIVES, FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, TAB_DIRECTIVES, BakerApiError],
  viewProviders: [BS_VIEW_PROVIDERS]
})

export class DutyDayComponent implements OnInit {
  dutyDay: any;
  isAdmin: boolean;
  history: Array<any>;
  assignables: Array<any>;
  error: string;

  modalState = {patrolId: -1, patrolName: '', hasSubs: false, hasPending: false};
  subCreateAssignForm: FormGroup;
  subAssignForm: FormGroup;

  @ViewChild('managePatrolModal') public managePatrolModal: ModalDirective;

  constructor(private _apiService: BakerApiService, private _route: ActivatedRoute, private _fb: FormBuilder) {}

  ngOnInit() {
    //get the duty day patrols
    //also check if current user is an admin
    this.updateDutyDay(() => {
        let adminRole: Object;
        this._apiService.findRole("leader").subscribe(
          role => adminRole = role,
          err => {},
          () => {
            this.isAdmin = this.isRoleAdmin(adminRole);
          }
        );
      }
    );

    this.subCreateAssignForm = this._fb.group({
      reason: '',
      assigned_id: [0, validateIdSelection]
    });

    this.subAssignForm = this._fb.group({
      assigned_id: [0, validateIdSelection]
    });
  }

  showManagePatrolModal(patrolId: number, patrolName: string, hasSubs: boolean, hasPending: boolean) {
    this.modalState={patrolId: patrolId, patrolName: patrolName, hasSubs: hasSubs, hasPending: hasPending};
    this.error = '';
    if (hasSubs) {
      this.updateSubHistory(patrolId, () => {
        let id = this.history[0].sub.id;
        this.subAssignForm.controls['assigned_id'].setValue(id ? id : 0);
      });
    }
    this.updateAssignables(patrolId);
    this.managePatrolModal.show();
    
  }

  closeManagePatrolModal() {
    this.modalState = {patrolId: -1, patrolName: '', hasSubs: false, hasPending: false};
    this.error = 'foo';
    this.history = null;
    this.assignables = null;
    this.subCreateAssignForm.reset();
    this.subAssignForm.reset();
    this.managePatrolModal.hide();
  }
  
  onSubRequestAssignSubmit() {
    this._apiService.createSubAssignRequest(this.modalState.patrolId, this.subCreateAssignForm.value).subscribe(
      success => {
        this.updateDutyDay();
        this.closeManagePatrolModal();
      },
      error => this.error = error
    );
  }

  onSubAssignSubmit(subId: number) {
    this._apiService.assignSubRequest(subId, this.subAssignForm.value).subscribe(
      success => {
        this.closeManagePatrolModal();
      },
      error => this.error = error
    );
  }

  private updateDutyDay(lambda  = ()=>{}) {
    this._route.params.forEach((params: Params) => {
      let id = +params['id'];
      this._apiService.dutyDay(id).subscribe(
        dd => this.dutyDay = dd,
        err => {},
        lambda
      );
    });
  }

  private updateSubHistory(patrolId: number, lambda = ()=>{}) {
    this._apiService.getSubHistory(patrolId).subscribe(
      history => this.history = history,
      err=>{},
      lambda
    );
  }

  private updateAssignables(patrolId: number) {
    this._apiService.getAssignableUsers(patrolId).subscribe(
      assignables => this.assignables = assignables
    );
  }

  private isRoleAdmin(role: any) : boolean {
    if (role) {
      if (role.role === 'leader') {
        return role.season_id == this.dutyDay.season_id && role.team_id == this.dutyDay.team.id;
      } else if (role.role === 'admin') {
        return true;
      }
    }
    return false;
  }

}

