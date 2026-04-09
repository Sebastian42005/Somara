import { Routes } from '@angular/router';
import { Classes } from './classes/classes';
import { Home } from './home/home';
import { Pricing } from './pricing/pricing';
import { Timetable } from './timetable/timetable';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'classes', component: Classes },
  { path: 'timetable', component: Timetable },
  { path: 'pricing', component: Pricing },
  { path: '**', redirectTo: '' },
];
