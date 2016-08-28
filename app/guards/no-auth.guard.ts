import {Injectable} from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

import {IAuthService} from '../services/iauth.service';

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(private _authService: IAuthService, private _router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this._authService.isLoggedIn()) {
      return true;
    }

    this._router.navigate(['Dash']);
    return false;
  }
}

