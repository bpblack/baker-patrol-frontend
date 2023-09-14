import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, interval, of, startWith, switchMap } from 'rxjs';
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
  public isAdmin: boolean = false;
  public isStaff: boolean = false;
  public isCollapsed: boolean = false;
  public user: Observable<User>;
  public igear: IconDefinition = faGear;
  public ipower: IconDefinition = faPowerOff;
  @ViewChild('logoutModal') logoutElement: any;

  private logoutRef: BsModalRef;
  private _logoutPoll: Subscription;
  private _adminRoles: Set<string> = new Set(['admin', 'leader']);

  constructor(private _apiService: BakerApiService, private _modalService: BsModalService, private _router: Router) {  }

  ngOnInit(): void {
    // initialize the logout poll
    this._logoutPoll = interval(6000).pipe(
      startWith(0),
      switchMap(() => of(this._apiService.isLoggedIn()))
    ).subscribe( (p: boolean) => {
      if (!p) {
        this.logoutRef = this._modalService.show(this.logoutElement, {animated: true, ignoreBackdropClick: true});
        this._logoutPoll.unsubscribe();
      }
    });
    // initialize the user subscription
    this.user = this._apiService.currentUser;
    this.user.subscribe(
      (user: User) => {
        if (user.name !== undefined) {
          user.roles.forEach((r: Role) => {
            if (r.role === 'staff') {
              this.isStaff = true;
            } else if (this._adminRoles.has(r.role)) {
              this.isAdmin = true;
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
    this._apiService.logout();
    this._router.navigate(['Login']);
  }

}
