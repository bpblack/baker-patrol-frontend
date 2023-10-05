import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, interval, of, startWith, switchMap } from 'rxjs';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IconDefinition, faChalkboardUser, faGear, faPowerOff, faSchoolFlag } from '@fortawesome/free-solid-svg-icons';
import { BakerApiService, Role, User } from '../../shared/services/baker-api.service';

@Component({
  selector: 'baker-patrol-dash',
  templateUrl: './dash.component.html',
  providers: [{provide: BsDropdownConfig, useValue: {isAnimated: true, autoClose: true}}]
})
export class DashComponent implements OnInit, OnDestroy {
  public isAdmin: boolean = false;
  public cprAdmin: boolean = false;
  public isCollapsed: boolean = true;
  public user: Observable<User>;
  public igear: IconDefinition = faGear;
  public ipower: IconDefinition = faPowerOff;
  public ischool: IconDefinition = faSchoolFlag;
  public ichalkboard: IconDefinition = faChalkboardUser;
  @ViewChild('logoutModal') logoutElement: any;

  private logoutRef: BsModalRef;
  private _logoutPoll: Subscription;
  private _adminRoles: Set<string> = new Set(['admin', 'leader']);

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
        if (user.first_name !== undefined) {
          user.roles.forEach((r: Role) => {
            if (r.role === 'admin' || r.role === 'cprior' || r.role === 'cprinstructor') {
              this.cprAdmin = true;
            }
            if (this._adminRoles.has(r.role)) {
              if (!('season_id' in r) || +r.season_id! === +user.seasons[0].id) {
                this.isAdmin = true;
              }
            }
          });
        }
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
