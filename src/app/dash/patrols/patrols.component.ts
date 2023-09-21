import { Component, ViewChild } from '@angular/core';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, concatMap, interval, startWith, switchMap } from 'rxjs';
import { BakerApiService, PatrolDetails, Season, SubAssignment, Substitution, Substitutions } from 'src/app/shared/services/baker-api.service';
import { isAssignmentSuccessEvent, isFormSubmittedEvent } from '../shared-forms/form-types';

interface ITab {
  active: boolean,
  disabled: boolean
}

interface FormSubmittedEvent {
  submitted: boolean;
}

interface AssignmentSuccessEvent {
  success: SubAssignment;
}

@Component({
  selector: 'baker-patrols',
  templateUrl: './patrols.component.html'
})
export class PatrolsComponent {
  public tabs: ITab[];
  public deleted: boolean = false;
  public accepted: boolean = false;
  public error: string | null = null;
  public disableClose = {createSub: false, manageSub: false, manageRequest: false};
  public igear: IconDefinition = faGear;

  public season: Season;
  public subs: Substitutions;
  public patrols: PatrolDetails[];
  public modalPatrol: PatrolDetails | null = null;
  public modalRequest: Substitution | null = null;
  
  @ViewChild('createSub') createSub: any;
  @ViewChild('manageSub') manageSub: any;
  @ViewChild('manageRequest') manageRequest: any;

  private _poll: Subscription;
  private _lastPollTime: string;
  private _createSubRef: BsModalRef;
  private _manageSubRef: BsModalRef;
  private _manageRequestRef: BsModalRef;
  private _modalConfig =  {animated: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-lg'};

  constructor(private _api: BakerApiService, private _modal: BsModalService) { 
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
  }

  ngOnInit() {
    let d = new Date();
    this._lastPollTime = d.toISOString();
    this._api.currentUserSeason.pipe(
      concatMap((s: Season) =>{
        this.season = s;
        this.startPoll();
        return this._api.getPatrols(this.season.id);
      })
    ).subscribe(
      (p: PatrolDetails[]) => {
        this.patrols = p;
      }
    );
  }
  
  ngOnDestroy() {
    this._poll.unsubscribe();
  }

  startPoll() {
    if (this._poll) return;
    let params: string[][] = [['substitutions', 'false'], ['requests', 'both'], ['requests_since', this._lastPollTime], ['future', 'true']];
    this._poll = interval(60000).pipe(
      startWith(0),
      switchMap(() => this._api.getSubstitutions(this.season.id, params))
    ).subscribe(
      (r: Substitutions) => {
        // r.substitutions are the requests directed at user
        // r.requests is current user's requests directed at others
        this.subs = r;
        this.tabs[1].disabled = (this.subs.substitutions.length === 0);
        this._lastPollTime = this.subs.timestamp;
      }
    )
  }

  selectTab(i: number) {
    this.tabs[i].active = true;
  }

  showCreateSub($event: number) {
    this.modalPatrol = this.patrols[$event];
    this._createSubRef = this._modal.show(this.createSub, this._modalConfig);
  }

  hideCreateSub() {
    this.modalPatrol = null;
    this._createSubRef.hide();
  }

  onCreateSub($event: FormSubmittedEvent | AssignmentSuccessEvent) {
    if(isAssignmentSuccessEvent($event)) {
      this.modalPatrol!.pending_substitution = $event.success;
      this.hideCreateSub();
    } else if(isFormSubmittedEvent($event)) {
      this.disableClose.createSub = $event.submitted;
    }
  }

  showManageSub($event: number) {
    this.modalPatrol = this.patrols[$event];
    this._manageSubRef = this._modal.show(this.manageSub, this._modalConfig);
  }

  hideManageSub() {
    this.modalPatrol = null;
    this._manageSubRef.hide();
  }

  onAssignSub($event: FormSubmittedEvent | AssignmentSuccessEvent) {
    if(isAssignmentSuccessEvent($event)) {
      this.modalPatrol!.pending_substitution = $event.success;
      this.hideManageSub();
    } else if(isFormSubmittedEvent($event)) {
      this.disableClose.manageSub = $event.submitted;
    }
  }

  onSubDelete() {
    //TODO
  }

  modalPatrolSub() {
    let id = this.modalPatrol!.pending_substitution!.id;
    let sub_id = this.modalPatrol!.pending_substitution!.sub_id;
    let sub_name = this.modalPatrol!.pending_substitution!.sub_name;
    return {id: id ? id : 0, sub_id: sub_id ? sub_id : 0, sub_name: sub_name ? sub_name : ''};
  }

  showManageRequest($event: number) {
    this.modalRequest = this.subs.substitutions[$event]
    this._manageRequestRef = this._modal.show(this.manageRequest, this._modalConfig);
  } 

  hideManageRequest() {
    this._manageRequestRef.hide();
  }

  onRequestAccept() {
    //TODO
  }

  onRequestReject($event: FormSubmittedEvent | boolean) {
    this._api.log("finalizing reject");
    this.subs.substitutions.forEach( (item, index) => {
      if (item === this.modalRequest) {
        this._api.log("  -> Removing request at index", index);
        this.subs.substitutions.splice(index, 1);
      }
    });
    this._manageRequestRef.hide();
  }

  clearError() {
    //TODO
  }
}

