import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subscription, concatMap, forkJoin, interval, map, of, switchMap } from 'rxjs';
import { BakerApiService, DutyDayDetail, Role, User } from 'src/app/shared/services/baker-api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'baker-duty-day',
  templateUrl: './duty-day.component.html'
})
export class DutyDayComponent {
  public dutyDay: BehaviorSubject<DutyDayDetail> = new BehaviorSubject(<DutyDayDetail>{});
  public available: BehaviorSubject<string[]> = new BehaviorSubject(<string[]>[]);
  public isAdmin: boolean;
  public isLeader: boolean;
  public isStaff: boolean;
  private _id: number = -1;
  private _poll: Subscription;
  constructor(private _api: BakerApiService, private _modalService: BsModalService, private _route: ActivatedRoute) { }

  ngOnInit() {
    if (this._id === -1) {
      this._route.params.forEach((params: Params) => this._id = +params['id']);
    }
    // initialize our role flags, duty day, and (if admin or leader) available emails
    forkJoin([this._api.getDutyDay(this._id), this._api.currentUser.pipe(map(u => u.roles))]).pipe(
      concatMap(
        ([dd, ra]: [DutyDayDetail, Role[]]) => {
          this.dutyDay.next(dd);
          ra.forEach(r => {
            if(r) {
              if (r.role === 'admin') {
                this.isAdmin = true;
              } else if (r.role === 'leader') {
                this.isLeader = r.season_id === dd.season_id && r.team_id === dd.team.id;
              } else if (r.role === 'staff'){
                this.isStaff = true;
              }
            }
          });
          this._api.log('Initialized duty-day data', dd, this.isLeader || this.isAdmin);
          return (this.isAdmin || this.isLeader) ? this._api.getAvailablePatrollers(this._id) : of(<string[]>[]);
        }
      )
    ).subscribe((a: string[]) => {
      this._api.log("Got available emails:", a);
      this.available.next(a);
    });

    // poss once a minute for updated data and emails
    this._poll = interval(60000).pipe(
      switchMap(() => forkJoin(
        [
          this._api.getDutyDay(this._id), 
          this.isAdmin || this.isLeader? this._api.getAvailablePatrollers(this._id) : of(<string[]>[])
        ])
      )
    ).subscribe( 
      ([dd, a]: [DutyDayDetail, string[]]) => {
        this._api.log("Updated duty day;", dd, a)
        this.dutyDay.next(dd);
        this.available.next(a);
      }
    );
  }

  ngOnDestroy() {
    this._poll.unsubscribe();
  }
  
}