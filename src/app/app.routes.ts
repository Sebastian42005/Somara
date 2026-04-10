import { Routes } from '@angular/router';
import { Classes } from './classes/classes';
import { Home } from './home/home';
import { Pricing } from './pricing/pricing';
import { Admin } from './admin/admin';
import { Timetable } from './timetable/timetable';
import { adminOnlyGuard } from './core/guards/admin-only.guard';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'classes', component: Classes },
  { path: 'timetable', component: Timetable },
  { path: 'admin', component: Admin, canActivate: [adminOnlyGuard] },
  { path: 'pricing', component: Pricing },
  { path: '**', redirectTo: '' },
];
