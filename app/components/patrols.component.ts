import {Component, OnInit, ViewChild} from '@angular/core';
import {CORE_DIRECTIVES}   from '@angular/common';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS, ModalDirective, TAB_DIRECTIVES, TabDirective, TabsetComponent} from 'ng2-bootstrap/ng2-bootstrap';
import {BakerApiService} from '../services/baker-api.service';
import {validateIdSelection} from '../validations/validations';
import {BakerApiError} from './error.component';

@Component({
  selector: 'baker-patrol-patrols',
  templateUrl: 'app/views/patrols.component.html',
  directives: [MODAL_DIRECTIVES, CORE_DIRECTIVES, FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, TAB_DIRECTIVES, BakerApiError],
  viewProviders: [BS_VIEW_PROVIDERS]
})

export class PatrolsComponent implements OnInit {
  patrols: Array<any>;
  assignables: Array<any>;
  requests: Array<any>;
  seasons: Array<any>;

  error: string;

  modalState =  {patrolId: -1, date: '', subId: -1, subUserId: -1, subName: ''};
  createSubTabset: boolean;
  manageSubTabset: boolean;
  manageRequestTabset: boolean;
  subCreateEmailForm: FormGroup;
  subCreateAssignForm: FormGroup;
  subAssignForm: FormGroup;
  subRemindForm: FormGroup;
  requestRejectForm: FormGroup;

  @ViewChild('createSubModal') public createSubModal: ModalDirective;
  @ViewChild('manageSubModal') public manageSubModal: ModalDirective;
  @ViewChild('manageRequestModal') public manageRequestModal: ModalDirective;

  constructor(private _apiService: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    //get the current user's seasons, then the patrols for the most recent season
    this._apiService.userSeasons().subscribe(
      success => { this.seasons = success; },
      err => {},
      () => { 
        this.updatePatrols();
        this.updateRequests();
      }
    );

    this.subCreateEmailForm = this._fb.group({
      reason: '',
      message: ''
    });

    this.subCreateAssignForm = this._fb.group({
      reason: '',
      assigned_id: [0, validateIdSelection]
    });

    this.subAssignForm = this._fb.group({
      assigned_id: [0, validateIdSelection]
    });

    this.subRemindForm = this._fb.group({
      message: ''
    });

    this.requestRejectForm = this._fb.group({
      message: ''
    });
    
  }

  // Sub request creation modal controls
  showCreateSubModal(patrolId: number, date: string) {
    this.createSubTabset = true;
    this.clearError();
    this.modalState = {patrolId: patrolId, date: date, subId: -1, subUserId: -1, subName: ''};
    this.updateAssignables(patrolId);
    this.createSubModal.show();
  }

  closeCreateSubModal() {
    this.clearError();
    this.subCreateEmailForm.reset();
    this.subCreateAssignForm.reset();
    this.createSubModal.hide();
    this.createSubTabset = false;
  }

  onSubRequestEmailSubmit() {
    this._apiService.createSubEmailRequest(this.modalState.patrolId, this.subCreateEmailForm.value).subscribe(
      success => {
        this.updatePatrols();
        this.closeCreateSubModal();
      },
      error => this.error = error
    );
  }

  onSubRequestAssignSubmit() {
    this._apiService.createSubAssignRequest(this.modalState.patrolId, this.subCreateAssignForm.value).subscribe(
      success => {
        this.updatePatrols();
        this.closeCreateSubModal();
      },
      error => this.error = error
    );
  }

  // Sub management modal controls
  showManageSubModal(patrolId: number, date: string, subId: number, subUserId: number, subName: string) {
    this.manageSubTabset=true;
    this.clearError();
    this.modalState = {patrolId: patrolId, date: date, subId: subId, subUserId: subUserId, subName: subName};
    this.updateAssignables(patrolId, () => {
      this.subAssignForm.controls['assigned_id'].setValue(subUserId); 
    });
    this.manageSubModal.show();
  }

  closeManageSubModal() {
    this.clearError();
    this.subAssignForm.reset();
    this.subRemindForm.reset();
    this.manageSubModal.hide();
    this.manageSubTabset=false;
  }

  onSubAssignSubmit() {
    this._apiService.assignSubRequest(this.modalState.subId, this.subAssignForm.value).subscribe(
      success => {
        this.updatePatrols();
        this.closeManageSubModal();
      },
      error => this.error = error
    );
  }

  onSubRemindSubmit() {
    this._apiService.remindSubRequest(this.modalState.subId, this.subRemindForm.value).subscribe(
      success => this.closeManageSubModal(),
      error => this.error = error
    );
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
  showManageRequestModal(subId:number, date: string, subName: string) {
    this.manageRequestTabset=true;
    this.clearError();
    this.modalState = {patrolId: -1, date: date, subId: subId, subUserId: -1, subName: subName};
    this.manageRequestModal.show();
  }

  closeManageRequestModal() {
    this.clearError();
    this.requestRejectForm.reset();
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
    this._apiService.rejectSubRequest(this.modalState.subId, this.requestRejectForm.value).subscribe(
      success => {
        this.updateRequests();
        this.closeManageRequestModal();
      },
      error => this.error = error
    );
  }

  updatePatrols() {
    this._apiService.patrols(this.seasons[0].id).subscribe(
      patrols => this.patrols = patrols
    );
  }

  updateAssignables(patrolId: number, lambda = ()=>{}) {
    this._apiService.getAssignableUsers(patrolId).subscribe(
      assignables => this.assignables = assignables,
      err => {},
      lambda
    );
  }

  updateRequests() {
    this._apiService.getSubRequests(this.seasons[0].id).subscribe(
      requests => this.requests = requests
    );
  }

  clearError() {
    this.error = null;
  }

  get diagnostic() { return JSON.stringify({'patrols': this.patrols}); }

}
