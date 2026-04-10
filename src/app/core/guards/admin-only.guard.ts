import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SomaraSignalStore } from '../store/somara-signal.store';

export const adminOnlyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(SomaraSignalStore);
  if (!store.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  const role = store.auth()?.role;
  return role?.trim().toLowerCase() === 'admin' ? true : router.createUrlTree(['/']);
};
