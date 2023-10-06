import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BakerApiService, User, hasRole } from '../services/baker-api.service';
import { catchError, map, of } from 'rxjs';

export function GetRoleGuard(rs: Set<string>): CanActivateFn {
  return () => {
    const api = inject(BakerApiService)
    const router = inject(Router)
    return api.currentUser.pipe(
      map((u: User) => {
        let ci: boolean = hasRole(u.roles, rs, u.seasons[0].id);
        if (ci) {
          return true;
        } else {
          router.navigate(['/Dash']);
          return false;
        }
      }),
      catchError((e: Error) => {
        router.navigate(['/Dash']);
        return of(false);
      })
    );
  }
}