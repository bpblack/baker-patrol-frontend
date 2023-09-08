import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, interval, of } from 'rxjs';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IconDefinition, faGear, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { BakerApiService, Role, User } from '../../shared/services/baker-api.service';

@Component({
  selector: 'baker-patrol-dash',
  templateUrl: './dash.component.html',
  //styleUrls: ['./dash.component.css'],
  providers: [{provide: BsDropdownConfig, useValue: {isAnimated: true, autoClose: true}}]
})
export class DashComponent implements OnInit, OnDestroy {
  public igear: IconDefinition = faGear;
  public ipower: IconDefinition = faPowerOff;
  public isCollapsed: boolean = false;
  @ViewChild('logoutModal') logoutElement: any;
  public loaded: boolean = false;
  public isAdmin: Observable<boolean>;
  public isStaff: Observable<boolean>;
  public name: Observable<string>;

  private logoutRef: BsModalRef;
  private _logoutPoll: Subscription;
  private _userSubscription: Subscription;
  private _adminRoles: Set<string> = new Set(['admin', 'leader']);

  constructor(private _apiService: BakerApiService, private _modalService: BsModalService, private _router: Router) {  }

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
              this.isStaff = of(true);
            } else if (this._adminRoles.has(r.role)) {
              this.isAdmin = of(true);
            }
          });
          this.name = of(user.name);
          this.loaded = true;
        }
      }
    );
  }

  collapseClick() { this.isCollapsed = !this.isCollapsed; console.log("clicked. now val is: ", this.isCollapsed);}

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
