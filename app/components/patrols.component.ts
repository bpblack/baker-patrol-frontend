import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {ModalDirective} from 'ng2-bootstrap/ng2-bootstrap';
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
  templateUrl: 'app/views/patrols.component.html'
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
  
  private _updatePatrols: boolean;

  @ViewChild('createSubModal') public createSubModal: ModalDirective;
  @ViewChild('manageSubModal') public manageSubModal: ModalDirective;
  @ViewChild('manageRequestModal') public manageRequestModal: ModalDirective;

  constructor(private _apiService: BakerApiService) {}

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
        this._updatePatrols = true;
        this.updatePatrols();
        this._updatePatrols = false;
        this.updateRequests();
      }
    );
  }

  selectTab(i: number) {
    this.tabs[i].active = true;
    if (i == 0) {
      this.updatePatrols();
    }
  }

  disableOrEnableRequestsTab() {
    if (this.requests.length == 0) {
      this.tabs[0].active = true;
      this.tabs[1].disabled = true;
    } else if (this.tabs[1].disabled) {
      this.tabs[1].disabled = false;
    }
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

  onSubRequestCreate($event) {
    this.patrols[this.modalState.index].pending_substitution = $event;
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

  onSubRequestAssign($event) {
    this.patrols[this.modalState.index].pending_substitution = $event;
    this.closeManageSubModal();
  }

  onSubDeleteSubmit() {
    this._apiService.deleteSubRequest(this.modalState.subId).subscribe(
      success => {
        this.patrols[this.modalState.index].pending_substitution = null;
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
        this._updatePatrols = true;
        this.requests.splice(this.modalState.index, 1)
        this.disableOrEnableRequestsTab();
        this.closeManageRequestModal();
      },
      error => this.error = (error + ' Please reject this request if you are already patrolling on the given day.')
    );
  }

  onRequestRejectSubmit() {
    this.requests.splice(this.modalState.index, 1);
    this.disableOrEnableRequestsTab();
    this.closeManageRequestModal();
  }

  updatePatrols() {
    if (this._updatePatrols) {
      this._apiService.patrols(this.seasons[0].id).subscribe(
        patrols => this.patrols = patrols
      );
      this._updatePatrols = false;
    }
  }

  updateRequests() {
    this._apiService.getSubRequests(this.seasons[0].id).subscribe(
      requests => this.requests = requests,
      err => {},
      () => this.disableOrEnableRequestsTab()
    );
  }

  clearError() {
    this.error = null;
  }

  get diagnostic() { return JSON.stringify({'patrols': this.patrols}); }

}
