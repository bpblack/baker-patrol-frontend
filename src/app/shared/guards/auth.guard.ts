import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BakerApiService } from '../services/baker-api.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const api = inject(BakerApiService)
  const router = inject(Router)
  if (api.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/Login');
};
