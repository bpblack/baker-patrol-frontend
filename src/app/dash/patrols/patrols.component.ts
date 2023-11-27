import { Component, ViewChild } from '@angular/core';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, concatMap, finalize, interval, startWith, switchMap } from 'rxjs';
import { BakerApiService, PatrolDetails, PatrolDutyDay, Season, Substitution, Substitutions } from 'src/app/shared/services/baker-api.service';
import { AssignmentSuccessEvent, isAssignmentSuccessEvent, FormSubmittedEvent, isFormSubmittedEvent } from '../shared/form-types';

interface ITab {
  active: boolean,
  disabled: boolean
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
  public openCount: number = 0;
  
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
      },
      {
        //season requests tab
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
        // remove any patrols if r.requests accepted is true
        this.subs = r;
        this.subs.requests.forEach((r: Substitution) => {
          if(this.patrols && r.accepted) {
            const pi = this.patrols.findIndex((p: PatrolDetails) => p.id === r.patrol_id);
            this.patrols.splice(pi, 1);
          }
        })
        this.tabs[1].disabled = (this.subs.substitutions.length === 0);
        this._lastPollTime = this.subs.timestamp;
      }
    )
  }

  selectTab(i: number) {
    this.tabs[i].active = true;
  }

  deselectTab(i: number) {
    this.tabs[i].active = false;
  }

  onOpenRequests($event: number) {
    this.openCount = $event;
    if (this.openCount > 0) {
      this.tabs[2].disabled = false;
    }
  }

  showCreateSub($event: number) {
    this.modalPatrol = this.patrols[$event];
    this._createSubRef = this._modal.show(this.createSub, this._modalConfig);
  }

  hideCreateSub() {
    this.modalPatrol = null;
    this._createSubRef.hide();
    this.clearError();
  }

  onCreateSub($event: FormSubmittedEvent | AssignmentSuccessEvent) {
    if(isAssignmentSuccessEvent($event)) {
      this.modalPatrol!.pending_substitution = $event.success!;
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
    this.clearError();
  }

  onAssignSub($event: FormSubmittedEvent | AssignmentSuccessEvent | string) {
    if(isAssignmentSuccessEvent($event)) {
      this.modalPatrol!.pending_substitution = $event.success!;
      this.hideManageSub();
    } else if(isFormSubmittedEvent($event)) {
      this.disableClose.manageSub = $event.submitted;
    } else {
      console.error('Inline form error reported here? ' + $event);
    }
  }

  onSubDelete() {
    this.disableClose.manageSub = true;
    this._api.deleteSubRequest(this.modalPatrol!.pending_substitution!.id!).pipe(
      finalize(() => this.disableClose.manageSub = false)
    ).subscribe({
      next: (b: boolean) => {
        this.modalPatrol!.pending_substitution = null;
        this.hideManageSub();
      },
      error: (e: Error) => this.error = e.message
    })
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
    this.clearError();
  }

  onRequestAccept() {
    this.disableClose.manageRequest = true;
    this._api.acceptSubRequest(this.modalRequest!.id).pipe(
      finalize(() => this.disableClose.manageRequest = false)
    ).subscribe({
      next: (b: boolean) => {
        // remove the accepted request from the list of subs
        this.subs.substitutions.forEach((item, index) => {
          if (item === this.modalRequest) {
            this.subs.substitutions.splice(index, 1);
          }
        });
        // update the list of assigned patrols
        // array is already sorted, so create a new patrol detail, find the first patrol after that date
        // and splice in the new patrol detail at that index. saves an api call until the next poll
        const dd: PatrolDutyDay = {
          id: this.modalRequest!.duty_day.id, 
          season_id: this.season.id,
          date: this.modalRequest!.duty_day.date, 
          team: this.modalRequest!.duty_day.team!
        };
        const apd: PatrolDetails = {
          id: this.modalRequest!.patrol_id, 
          swapable: true, 
          pending_substitution: null, 
          duty_day: dd, 
          responsibility: this.modalRequest!.responsibility!
        };
        const adate = new Date(apd.duty_day.date);
        const idx = this.patrols.findIndex(p => {
          const pdate = new Date(p.duty_day.date);
          return pdate.getTime() > adate.getTime();
        })
        this.patrols.splice(idx, 0, apd);
        this._manageRequestRef.hide();
      },
      error: (e: Error) => this.error = e.message
    });
  }

  onRequestReject($event: FormSubmittedEvent | boolean) {
    this.subs.substitutions.forEach((item, index) => {
      if (item === this.modalRequest) {
        this.subs.substitutions.splice(index, 1);
      }
    });
    this._manageRequestRef.hide();
  }

  clearError() {
    this.error = null;
  }
}

