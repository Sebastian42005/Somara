import { Routes } from '@angular/router';
import { Classes } from './classes/classes';
import { Home } from './home/home';
import { Pricing } from './pricing/pricing';
import { Admin } from './admin/admin';
import { Timetable } from './timetable/timetable';
import { adminOnlyGuard } from './core/guards/admin-only.guard';
import { Profile } from './profile/profile';
import { Settings } from './settings/settings';
import { authenticatedGuard } from './core/guards/authenticated.guard';
import { teacherOnlyGuard } from './core/guards/teacher-only.guard';
import { Teacher } from './teacher/teacher';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'classes', component: Classes },
  { path: 'timetable', component: Timetable },
  { path: 'teacher', component: Teacher, canActivate: [teacherOnlyGuard] },
  { path: 'profile', component: Profile, canActivate: [authenticatedGuard] },
  { path: 'settings', component: Settings, canActivate: [authenticatedGuard] },
  { path: 'admin', component: Admin, canActivate: [adminOnlyGuard] },
  { path: 'pricing', component: Pricing },
  { path: '**', redirectTo: '' },
];
