import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, interval, of, startWith, switchMap } from 'rxjs';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { faCalendarDays, faChalkboardUser, faGear, faPowerOff, faSchoolFlag } from '@fortawesome/free-solid-svg-icons';
import { BakerApiService,User, hasRole } from '../../shared/services/baker-api.service';

@Component({
    selector: 'baker-patrol-dash',
    templateUrl: './dash.component.html',
    providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }],
    standalone: false
})
export class DashComponent implements OnInit, OnDestroy {
  public roles = {cpr: false, cpradmin: false, leader: false, admin: false};
  public cprRefresher: boolean = false;
  public isCollapsed: boolean = true;
  public user: Observable<User>;
  public icons = {gear: faGear, power: faPowerOff, school: faSchoolFlag, chalkboard: faChalkboardUser, calendar: faCalendarDays}
  @ViewChild('logoutModal') logoutElement: any;

  private logoutRef: BsModalRef;
  private _logoutPoll: Subscription;

  constructor(private _api: BakerApiService, private _modalService: BsModalService, private _router: Router) {  }

  ngOnInit(): void {
    // initialize the logout poll
    this._logoutPoll = interval(6000).pipe(
      startWith(0),
      switchMap(() => of(this._api.isLoggedIn()))
    ).subscribe( (p: boolean) => {
      if (!p) {
        this.logoutRef = this._modalService.show(this.logoutElement, {animated: true, backdrop: true, ignoreBackdropClick: true});
        this._logoutPoll.unsubscribe();
      }
    });
    // initialize the user subscription
    this.user = this._api.currentUser;
    this.user.subscribe(
      (user: User) => {
        this.roles.admin = hasRole(user.roles, new Set(['admin']));
        this.roles.cpradmin = this.roles.admin || hasRole(user.roles, new Set(['cprior']));
        this.roles.cpr = this.roles.cpradmin || hasRole(user.roles, new Set<string>(['cprinstructor']));
        this.roles.leader = this.roles.admin || hasRole(user.roles, new Set(['leader']), user.seasons[0].id);
        this.cprRefresher = (user.cpr_token !== null);
      }
    );
  }

  collapseClick() { this.isCollapsed = !this.isCollapsed; }

  ngOnDestroy(): void {
    this._logoutPoll.unsubscribe();
  }

  logout() {
    if (this.logoutRef !== undefined) {
      this.logoutRef.hide();
    }
    this._api.logout();
    this._router.navigate(['Login']);
  }

}
