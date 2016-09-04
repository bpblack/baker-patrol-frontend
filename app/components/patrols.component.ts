import {Component, OnInit, ViewChild} from '@angular/core';
import {CORE_DIRECTIVES}   from '@angular/common';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS, ModalDirective, TAB_DIRECTIVES, TabDirective, TabsetComponent} from 'ng2-bootstrap/ng2-bootstrap';
import {BakerApiService} from '../services/baker-api.service';
import {PatrolsTab} from './patrols_tab.component';
import {RequestsTab} from './requests_tab.component';
import {CreateSubForm} from './create_sub_form.component';
import {CreateAssignSubForm} from './create_assign_sub_form.component';
import {EmailSubForm} from './email_sub_form.component';
import {AssignSubForm} from './assign_sub_form.component';

class ModalState {
  private _index: number;
  private _patrolId: number;
  private _date: string;
  private _subId: number;
  private _subUserId: number;
  private _subName: string;

  constructor(index: number = -1, patrolId: number = 0, date: string = '', subId: number = 0, subUserId: number = 0, subName: string = '') {
    this._index = index;
    this._patrolId = patrolId;
    this._date = date;
    this._subId = subId;
    this._subUserId = subUserId;
    this._subName = subName;
  }
  get index() { return this._index; }
  get patrolId() { return this._patrolId; }
  get date() { return this._date; }
  get subId() { return this._subId; }
  get subUserId() { return this._subUserId; }
  get subName() { return this._subName; }
}

@Component({
  selector: 'baker-patrol-patrols',
  templateUrl: 'app/views/patrols.component.html',
  directives: [MODAL_DIRECTIVES, CORE_DIRECTIVES, TAB_DIRECTIVES, PatrolsTab, RequestsTab, CreateSubForm, CreateAssignSubForm, EmailSubForm, AssignSubForm],
  viewProviders: [BS_VIEW_PROVIDERS]
})
export class PatrolsComponent implements OnInit {
  patrols: Array<any>;
  requests: Array<any>;
  seasons: Array<any>;
  tabs: Array<any>

  error: string;
  modalState: ModalState; 
  createSubTabset: boolean;
  manageSubTabset: boolean;
  manageRequestTabset: boolean;

  @ViewChild('createSubModal') public createSubModal: ModalDirective;
  @ViewChild('manageSubModal') public manageSubModal: ModalDirective;
  @ViewChild('manageRequestModal') public manageRequestModal: ModalDirective;

  constructor(private _apiService: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.tabs = [
      {
        //patrols tab
        active: true,
        disabled: false
      },
      {
        //requests tab
        active: false,
        disabled: true
      }
    ];

    this.modalState = new ModalState();
    //get the current user's seasons, then the patrols for the most recent season
    this._apiService.userSeasons().subscribe(
      success => { this.seasons = success; },
      err => {},
      () => { 
        this.updatePatrols();
        this.updateRequests();
      }
    );
  }

  // Sub request creation modal controls
  showCreateSubModal($event) {
    this.createSubTabset = true;
    this.modalState = new ModalState($event.index, $event.patrolId, $event.date);
    this.createSubModal.show();
  }

  closeCreateSubModal() {
    this.modalState = new ModalState();
    this.createSubModal.hide();
    this.createSubTabset = false;
  }

  onSubRequestEmailSubmit() {
    this.updatePatrols();
    this.closeCreateSubModal();
  }

  onSubRequestAssignSubmit() {
    this.updatePatrols();
    this.closeCreateSubModal();
  }

  // Sub management modal controls
  showManageSubModal($event) {
    this.manageSubTabset=true;
    this.modalState = new ModalState($event.index, $event.patrolId, $event.date, $event.subId, $event.subUserId, $event.subName);
    this.manageSubModal.show();
  }

  closeManageSubModal() {
    this.clearError();
    this.modalState = new ModalState();
    this.manageSubTabset=false;
    this.manageSubModal.hide();
  }

  onSubAssignSubmit() {
    this.updatePatrols();
    this.closeManageSubModal();
  }

  onSubRemindSubmit() {
    this.closeManageSubModal();
  }

  onSubDeleteSubmit() {
    this._apiService.deleteSubRequest(this.modalState.subId).subscribe(
      success => {
        this.updatePatrols();
        this.closeManageSubModal();
      },
      error => this.error = error
    );
  }

  // Sub request controls
  showManageRequestModal($event) {
    this.manageRequestTabset=true;
    this.modalState = new ModalState($event.index, 0, $event.date, $event.requestId, 0, $event.subName);
    this.manageRequestModal.show();
  }

  closeManageRequestModal() {
    this.clearError();
    this.modalState = new ModalState();
    this.manageRequestModal.hide();
    this.manageRequestTabset=false;
  }

  onRequestAcceptSubmit() {
    this._apiService.acceptSubRequest(this.modalState.subId).subscribe(
      success => {
        this.updatePatrols();
        this.updateRequests();
        this.closeManageRequestModal();
      },
      error => this.error = (error + ' Please reject this request if you are already patrolling on the given day.')
    );
  }

  onRequestRejectSubmit() {
    this.updateRequests();
    this.closeManageRequestModal();
  }

  updatePatrols() {
    this._apiService.patrols(this.seasons[0].id).subscribe(
      patrols => this.patrols = patrols
    );
  }

  updateRequests() {
    this._apiService.getSubRequests(this.seasons[0].id).subscribe(
      requests => this.requests = requests,
      err => {},
      () => {
        if (this.requests.length == 0) {
          if (this.tabs[0].active == false) {
            this.tabs[0].active = true;
          }
          this.tabs[1].disabled = true;
        } else {
          this.tabs[1].disabled = false;
        }
      }
    );
  }

  clearError() {
    this.error = null;
  }

  get diagnostic() { return JSON.stringify({'patrols': this.patrols}); }

}
