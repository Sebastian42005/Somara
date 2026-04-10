import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SomaraSignalStore } from '../store/somara-signal.store';

export const authenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(SomaraSignalStore);

  return store.isAuthenticated() ? true : router.createUrlTree(['/']);
};
