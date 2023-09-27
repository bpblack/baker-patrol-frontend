import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription, concatMap, forkJoin, interval, map, of, switchMap } from 'rxjs';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SwapResult } from './responsibility-swap-form/responsibility-swap-form.component';
import { BakerApiService, DutyDayDetail, LatestSub, Patrol, Role, SubHistory } from 'src/app/shared/services/baker-api.service';
import { AssignmentSuccessEvent, FormSubmittedEvent, isAssignmentSuccessEvent, isFormSubmittedEvent } from '../shared-forms/form-types';

export interface PatrolResponsibility {
  patrolId: number;
  name: string;
}

@Component({
  selector: 'baker-duty-day',
  templateUrl: './duty-day.component.html',
  providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }]
})
export class DutyDayComponent {
  public dutyDay: DutyDayDetail;
  public available: string[];
  public isAdmin: boolean = false;
  public isLeader: boolean = false;
  public disable: boolean = false;
  public patrolling: string[] = [];
  public hosting: string[] = [];
  public swapRow: number = -1;
  public managePatrol: Patrol | null = null;
  public responsibilities = new Map<string, PatrolResponsibility[]>();
  public patrolRow = new Map<number, number>();
  public history: Observable<SubHistory[]>;
  public igear: IconDefinition = faGear;
  public manageRef: BsModalRef;
  @ViewChild('manageModal') manageElement: any;

  private _id: number = -1;
  private _poll: Subscription;

  constructor(private _api: BakerApiService, private _modal: BsModalService, private _route: ActivatedRoute) { }

  ngOnInit() {
    if (this._id === -1) {
      this._route.params.forEach((params: Params) => this._id = +params['id']);
    }
    // initialize our role flags, duty day, and (if admin or leader) available emails
    let x: Role[];
    this._api.currentUser.pipe(map(u => u.roles)).pipe(
      concatMap(
        (ra: Role[]) => {
          x = ra;
          return this._api.getDutyDay(this._id);
        }
      )
    ).pipe(
      concatMap((dd: DutyDayDetail) => {
        this.updateRoles(x, dd.season_id, dd.team.id);
        this.updateDutyDay(dd);
        return (this.isAdmin || this.isLeader) ? this._api.getAvailablePatrollers(this._id) : of(<string[]>[]);
      })
    ).subscribe((a: string[]) => {
      this.available = a;
    });

    // poll once a minute for updated data and emails
    this._poll = interval(60000).pipe(
      switchMap(() => forkJoin(
        [
          this._api.getDutyDay(this._id), 
          (this.isAdmin || this.isLeader)? this._api.getAvailablePatrollers(this._id) : of(<string[]>[])
        ])
      )
    ).subscribe( 
      ([dd, a]: [DutyDayDetail, string[]]) => {
        this.updateDutyDay(dd);
        this.available = a;
      }
    );
  }

  ngOnDestroy() {
    this._poll.unsubscribe();
  }

  availableMailTo() {
    return "mailto:?bcc=" + this.available.join(",") + "&subject=" + this.dutyDay.team.name + " Duty Day " + this.dutyDay.date;
  }

  patrollingMailTo() {
    return "mailto:?cc=" + this.patrolling.join(",") + "&subject=" + this.dutyDay.team.name + " Duty Day " + this.dutyDay.date;
  }

  hostingMailTo() {
    return "mailto:?cc=" + this.hosting.join(",") + "&subject=" + this.dutyDay.team.name + " Duty Day " + this.dutyDay.date;
  }

  patrollingAndHostingMailTo() {
    return "mailto:?cc=" + this.patrolling.join(",") + "," +this.hosting.join(",") + "&subject=" + this.dutyDay.team.name + " Duty Day " + this.dutyDay.date;
  }

  rowColor(patrollerId: number, latestSub: LatestSub) : string {
    if (this.isLeader || this.isAdmin) {
      if (latestSub) {
        if (latestSub.accepted) {
          return 'table-success';
        } else {
          return latestSub.sub_id ? 'table-warning' : 'table-danger';
        }
      } else if (patrollerId === null) {
        return 'danger';
      }
    }
    return '';
  }

  setSwapRow(index: number) {
    this.swapRow = index;
  }

  showManageModal(i: number) {
    this.managePatrol = this.dutyDay.patrols[i];
    this.history = this._api.getSubHistory(this.managePatrol.id);
    this.manageRef = this._modal.show(this.manageElement, {animated: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-lg'});
  }

  closeManageModal() {
    this.managePatrol = null;
    this.manageRef.hide();
  }

  onPatrolSwap(swap: SwapResult) {
    this.swapRow = -1;
    if (swap.from !== -1 || swap.to !== -1) {
      // get the patrols
      let r1: number = this.patrolRow.get(swap.from)!;
      let r2: number = this.patrolRow.get(swap.to)!;
      let p1 = this.dutyDay.patrols[r1];
      let p2 = this.dutyDay.patrols[r2];
      // swap their roles
      let tmp = p1.responsibility;
      p1.responsibility = p2.responsibility;
      p2.responsibility = tmp;
      //update the duty day patrols and the patrol id to row map
      this.dutyDay.patrols[r1] = p2;
      this.dutyDay.patrols[r2] = p1;
      this.patrolRow.set(p1.id, r2);
      this.patrolRow.set(p2.id, r1);
      for (let responsibility of this.responsibilities.get(p1.responsibility.role)!) {
        if (responsibility.patrolId === p1.id) {
          responsibility.patrolId = p2.id;
        } else if (responsibility.patrolId === p2.id) {
          responsibility.patrolId = p1.id;
        }
      }
    }
  }


  onSubCreateAssign($event: FormSubmittedEvent | AssignmentSuccessEvent) {
    if (isAssignmentSuccessEvent($event)) {
      const x: LatestSub = {id: $event.success.id!, accepted: false, sub_id: $event.success.sub_id};
      this.managePatrol!.latest_substitution = x;
      this.closeManageModal();
    } else if (isFormSubmittedEvent($event)){
      this.disable = $event.submitted;
    }
  }

  onSubAssign($event: FormSubmittedEvent | AssignmentSuccessEvent) {
    if (isAssignmentSuccessEvent($event)) {
      const x: LatestSub = {id: $event.success.id!, accepted: false, sub_id: $event.success.sub_id};
      this.managePatrol!.latest_substitution = x;
      this.closeManageModal()
    } else {
      this.disable = $event.submitted
    }
  }

  private updateRoles(ra: Role[], seasonId: number, teamId: number) {
    ra.forEach(r => {
      if(r) {
        if (r.role === 'admin') {
          this.isAdmin = true;
        } else if (r.role === 'leader') {
          this.isLeader = r.season_id === seasonId && r.team_id === teamId;
        }
      }
    });
  }

  private updateDutyDay(dd: DutyDayDetail) {
    const needsEmails = this.isAdmin || this.isLeader;
    this.dutyDay = dd;
    let up: string[] = [];
    let uh: string[] = [];
    this.patrolRow.clear();
    this.responsibilities.clear();
    this.dutyDay.patrols.forEach((p: Patrol, i: number) => {
      this.patrolRow.set(p.id, i);
      const pr: string = p.responsibility.role;
      if (needsEmails) {
        if ((pr === 'onhill' || pr === 'candidate') && ((this.isLeader && i > 0) || !this.isLeader)) {
          up.push(p.patroller.email!);
        } else if (pr === 'host') {
          uh.push(p.patroller.email!);
        }
      }
      let resp: PatrolResponsibility = {patrolId: p.id, name: p.responsibility.name + ' v' + p.responsibility.version};
      if (this.responsibilities.has(pr)) {
        this.responsibilities.get(pr)!.push(resp);
      } else {
        this.responsibilities.set(pr, [resp]);
      }
    });
    if (needsEmails) {
      this.patrolling = up;
      this.hosting = uh;
    }
  } 
}