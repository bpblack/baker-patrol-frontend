import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BakerApiService, Role, User } from '../services/baker-api.service';
import { catchError, map, of } from 'rxjs';

export const CprInstructorGuard: CanActivateFn = () => {
  const api = inject(BakerApiService)
  const router = inject(Router)
  return api.currentUser.pipe(
    map((u: User) => {
      let ci: boolean = false;
      u.roles.forEach((r: Role) => {
        if (r.role === 'admin' || r.role === 'cprior' || r.role === 'cprinstructor') {
          ci = true;
        }
      });
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
};