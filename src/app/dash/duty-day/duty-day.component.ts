import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription, forkJoin, interval, map } from 'rxjs';
import { BakerApiService, DutyDayDetail, Role, User } from 'src/app/shared/services/baker-api.service';

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
  constructor(private _apiService: BakerApiService, private _modalService: BsModalService, private _route: ActivatedRoute) { }

  ngOnInit() {
    if (this._id === -1) {
      this._route.params.forEach((params: Params) => this._id = +params['id']);
    }
    const joined = forkJoin([this._apiService.getDutyDay(this._id), 
      this._apiService.currentUser.pipe(map(u => u.roles)),
      this._apiService.getAvailablePatrollers(this._id)
    ]);
    joined.subscribe({
      next: (x: any[]) => {
        const dd: DutyDayDetail = x[0];
        const ra: Role[] = x[1];
        this.dutyDay.next(dd);
        this.available.next(x[2]);
        ra.forEach(r => {
          if(r) {
            if (r.role === 'admin') {
              console.log("admin");
              this.isAdmin = true;
            } else if (r.role === 'leader') {
              this.isLeader = r.season_id === dd.season_id && r.team_id === dd.team.id;
              if (this.isLeader) console.log("leader");
            } else if (r.role === 'staff'){
              this.isStaff = true;
            }
          }
        });
      }
    });

    this._poll = interval(60000).subscribe({
      next: x => {
        const polls = forkJoin([this._apiService.getDutyDay(this._id), this._apiService.getAvailablePatrollers(this._id)]).subscribe({
          next: (x: any[]) => {
            this.dutyDay.next(x[0]);
            this.available.next(x[1]);
            console.log(x);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this._poll.unsubscribe();
  }

  // private isRoleLeader(role: Role) : boolean {
  //   if (role && role.role === 'leader') {
  //     return role.season_id === this.dutyDay.season_id && role.team_id === this.dutyDay.team.id;
  //   }
  //   return false;
  // }

  // private isRoleAdmin(role: Role) : boolean {
  //   if (role && role.role === 'admin') {
  //     return true;
  //   }
  //   return false;
  // }

  // private isRoleStaff(role: Role) : boolean {
  //   if (role && role.role === 'staff') {
  //     return role.season_id === this.dutyDay.season_id;
  //   }
  //   return false;
  // }

  // private updateDutyDay(): Observable<DutyDayDetail> {
  //   if (this._id === -1) {
  //     this._route.params.forEach((params: Params) => this._id = +params['id']);
  //   }
  //   console.log("duty day id: ", this._id);
  //   return this._apiService.getDutyDay(this._id);
  // }

}
