import { Component, ViewChild } from '@angular/core';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, concatMap, interval, startWith, switchMap } from 'rxjs';
import { BakerApiService, PatrolDetails, Season, Substitution, Substitutions } from 'src/app/shared/services/baker-api.service';

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
  public season: Season;
  public modalPatrol: PatrolDetails | null = null;
  public patrols: PatrolDetails[];
  public modalRequest: Substitution | null = null;
  public subs: Substitutions;
  public disableClose = {createSub: false, manageSub: false, manageRequest: false};
  public igear: IconDefinition = faGear;

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
        this.tabs[1].disabled = (this.subs.requests.length === 0);
        this._lastPollTime = this.subs.timestamp;
      }
    )
  }

  selectTab(i: number) {
    this.tabs[i].active = true;
    // if (i === 0) {
    //   this.updatePatrols();
    // }
  }

  showCreateSub($event: number) {
    this.modalPatrol = this.patrols[$event];
    this._createSubRef = this._modal.show(this.createSub, this._modalConfig);
  }

  hideCreateSub() {
    this.modalPatrol = null;
    this._createSubRef.hide();
  }

  onCreateSub($event: any) {
    this.disableClose.createSub = true;
    //TODO stuff
    this.disableClose.createSub = false;
  }

  showManageSub($event: number) {
    this.modalPatrol = this.patrols[$event];
    this._manageSubRef = this._modal.show(this.manageSub, this._modalConfig);
  }

  hideManageSub() {
    this.modalPatrol = null;
    this._manageSubRef.hide();
  }

  modalPatrolSub() {
    let id = this.modalPatrol!.pending_substitution!.id;
    let sub_id = this.modalPatrol!.pending_substitution!.sub_id;
    let sub_name = this.modalPatrol!.pending_substitution!.sub_name;
    return {id: id ? id : 0, sub_id: sub_id ? sub_id : 0, sub_name: sub_name ? sub_name : ''};
  }

  onAssignSub($event: any) {
    this.disableClose.manageSub = true;
    //TODO stuff
    this.disableClose.manageSub = false;
  }

  showManageRequest($event: any) {
    this._manageRequestRef = this._modal.show(this.manageRequest, this._modalConfig);
  } 

  hideManageRequest() {
    this._manageRequestRef.hide();
  }

  clearError() {
    //TODO
  }
}

