import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, interval, of } from 'rxjs';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { faGear, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { BakerApiService, Role, User } from '../../shared/services/baker-api.service';

@Component({
  selector: 'baker-patrol-dash',
  templateUrl: './dash.component.html',
  //styleUrls: ['./dash.component.css'],
  providers: [{provide: BsDropdownConfig, useValue: {isAnimated: true, autoClose: true}}]
})
export class DashComponent implements OnInit, OnDestroy {
  
  logoutRef: BsModalRef;
  @ViewChild('logoutModal') logoutElement: any;
  public loaded: Observable<boolean>;
  public isAdmin = new Subject<boolean>();
  public isStaff = new Subject<boolean>();
  public name = new Subject<string>();
  public igear = faGear;
  public ipower = faPowerOff;
  private _logoutPoll: Subscription;
  private _userSubscription: Subscription;
  private _adminRoles: Set<string> = new Set(['admin', 'leader']);

  constructor(private _apiService: BakerApiService, private _modalService: BsModalService, private _router: Router) {
    this.isAdmin.next(false);
    this.isStaff.next(false);
  }

  ngOnInit(): void {
    // initialize the logout poll
    this._logoutPoll = interval(6000).subscribe(
      x => {
        if (!this._apiService.isLoggedIn()) {
          this.logoutRef = this._modalService.show(this.logoutElement, {ignoreBackdropClick: true});
          this._logoutPoll.unsubscribe();
        }
      }
    );
    // initialize the user subscription
    this._userSubscription = this._apiService.currentUser.subscribe(
      (user: User) => {
        if (user.name !== undefined) {
          user.roles.forEach((r: Role) => {
            if (r.role === 'staff') {
              this.isStaff.next(true);
            } else if (this._adminRoles.has(r.role)) {
              this.isAdmin.next(true);
            }
          });
        }
        this.name.next(user.name);
        this.loaded = of(true);
      }
    );
  }

  ngOnDestroy(): void {
    this._logoutPoll.unsubscribe();
  }

  logout() {
    if (this.logoutRef !== undefined) {
      this.logoutRef.hide();
    }
    this._apiService.logout();
    this._router.navigate(['Login']);
  }

}
