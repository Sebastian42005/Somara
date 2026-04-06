import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WeekdayPipe } from '../../pipes/weekday-pipe';
import { getCurrentWeek } from './models/day-entry.model';
import {
  filterEntriesForTimeOfDay,
  filterEntriesForWeekday,
  TimeOfDay,
  TimetableEntry,
  WeekdayInput,
} from './models/timetable-entry.model';
import { TimetableEntryComponent } from './timetable-entry/timetable-entry';

@Component({
  selector: 'app-timetable',
  imports: [
    WeekdayPipe,
    MatIconModule,
    TimetableEntryComponent
  ],
  templateUrl: './timetable.html',
  styleUrl: './timetable.scss',
})
export class Timetable {
  readonly timeOfDaySections: ReadonlyArray<{ key: TimeOfDay; label: string; icon: string }> = [
    { key: 'morning', label: 'Morgens', icon: 'wb_twilight' },
    { key: 'midday', label: 'Mittags', icon: 'wb_sunny' },
    { key: 'evening', label: 'Nachmittags', icon: 'wb_twilight' },
    { key: 'evening', label: 'Abends', icon: 'nights_stay' },
  ];

  timetable: TimetableEntry[] = [
    {
      name: 'Morgengold | Grow Flow',
      start: new Date('2026-04-26T09:30:00+02:00'),
      end: new Date('2026-04-26T10:30:00+02:00'),
      color: '#f1af12',
      teacher: {
        id: 'a6dff8ec-baa4-4386-b649-f9cb1fd464a2',
        name: 'Ali Kaan',
      },
    },
    {
      name: 'Himmelblau | Root Flow',
      start: new Date('2026-04-26T11:00:00+02:00'),
      end: new Date('2026-04-26T12:15:00+02:00'),
      color: '#4fc1e9',
      teacher: {
        id: 'a6dff8ec-baa4-4386-b649-f9cb1fd464a2',
        name: 'Ali Kaan',
      },
    },
    {
      name: 'Morgengold | Root Flow',
      start: new Date('2026-04-25T09:30:00+02:00'),
      end: new Date('2026-04-25T10:30:00+02:00'),
      color: '#f6cf72',
      teacher: {
        id: '8463a22f-afa5-4afa-9f9c-12c18f34e9ba',
        name: 'Manu',
      },
    },
    {
      name: 'Himmelblau | Grow Flow',
      start: new Date('2026-04-25T11:00:00+02:00'),
      end: new Date('2026-04-25T12:15:00+02:00'),
      color: '#3bafda',
      teacher: {
        id: '8463a22f-afa5-4afa-9f9c-12c18f34e9ba',
        name: 'Manu',
      },
    },
    {
      name: 'Luftmeer | PSYCHEDELIC BREATH®',
      start: new Date('2026-04-24T19:45:00+02:00'),
      end: new Date('2026-04-24T21:00:00+02:00'),
      color: '#2175a6',
      teacher: {
        id: '86c1c7dc-11db-47f4-936a-b47d6e5937cb',
        name: 'Helga',
      },
    },
    {
      name: 'Morgengold | All Level Flow',
      start: new Date('2026-04-24T07:30:00+02:00'),
      end: new Date('2026-04-24T08:30:00+02:00'),
      color: '#f5c75a',
      teacher: {
        id: 'a656689d-a337-407b-b256-46c909cd1900',
        name: 'Jolyane (eng)',
      },
    },
    {
      name: 'Himmelblau | Grow Flow',
      start: new Date('2026-04-24T10:00:00+02:00'),
      end: new Date('2026-04-24T11:15:00+02:00'),
      color: '#3bafda',
      teacher: {
        id: '1f755400-8397-4bd0-965b-56fbe0921ed5',
        name: 'Maro (eng)',
      },
    },
    {
      name: 'Morgengold | All Level Flow',
      start: new Date('2026-04-23T07:30:00+02:00'),
      end: new Date('2026-04-23T08:30:00+02:00'),
      color: '#f5c75a',
      teacher: {
        id: '2ed5f702-5e76-450a-86ec-8ea839f72206',
        name: 'Claudia',
      },
    },
    {
      name: 'Morgengold | All Level Flow',
      start: new Date('2026-04-22T07:30:00+02:00'),
      end: new Date('2026-04-22T08:30:00+02:00'),
      color: '#f5c75a',
      teacher: {
        id: '1af2882d-14cb-470b-ad52-2f8385d79537',
        name: 'Carina',
      },
    },
    {
      name: 'Morgengold | All Level Flow',
      start: new Date('2026-04-21T07:30:00+02:00'),
      end: new Date('2026-04-21T08:30:00+02:00'),
      color: '#f5c75a',
      teacher: {
        id: '00153e85-a13a-4f75-b3d5-932a3f6e63be',
        name: 'Denise',
      },
    },
    {
      name: 'Himmelblau | Root Flow',
      start: new Date('2026-04-21T10:00:00+02:00'),
      end: new Date('2026-04-21T11:00:00+02:00'),
      color: '#4fc1e9',
      teacher: {
        id: '00153e85-a13a-4f75-b3d5-932a3f6e63be',
        name: 'Denise',
      },
    },
    {
      name: 'Himmelblau | Root Flow',
      start: new Date('2026-04-22T10:00:00+02:00'),
      end: new Date('2026-04-22T11:00:00+02:00'),
      color: '#4fc1e9',
      teacher: {
        id: 'f9163a09-1b1e-4b2a-b93d-559fa692a9f5',
        name: 'Andrea',
      },
    },
    {
      name: 'Chroma | Pilates',
      start: new Date('2026-04-22T11:30:00+02:00'),
      end: new Date('2026-04-22T12:30:00+02:00'),
      color: '#0088a1',
      teacher: {
        id: 'f9163a09-1b1e-4b2a-b93d-559fa692a9f5',
        name: 'Andrea',
      },
    },
    {
      name: 'Chroma | Pilates',
      start: new Date('2026-04-21T11:30:00+02:00'),
      end: new Date('2026-04-21T12:30:00+02:00'),
      color: '#0088a1',
      teacher: {
        id: '7eb3dc1d-b1c2-4186-87dc-f537b79d4691',
        name: 'Juma',
      },
    },
    {
      name: 'Klangfarben | Sound & Flow',
      start: new Date('2026-04-23T10:00:00+02:00'),
      end: new Date('2026-04-23T11:00:00+02:00'),
      color: '#4fc1e9',
      teacher: {
        id: '4a9125b8-4e7e-4af5-88d4-86e070f0e009',
        name: 'Aileen',
      },
    },
    {
      name: 'Himmelblau | Grow Flow',
      start: new Date('2026-04-23T11:30:00+02:00'),
      end: new Date('2026-04-23T12:30:00+02:00'),
      color: '#3bafda',
      teacher: {
        id: '4a9125b8-4e7e-4af5-88d4-86e070f0e009',
        name: 'Aileen',
      },
    },
    {
      name: 'Morgengold | All Level Flow',
      start: new Date('2026-04-20T07:30:00+02:00'),
      end: new Date('2026-04-20T08:30:00+02:00'),
      color: '#f5c75a',
      teacher: {
        id: '8463a22f-afa5-4afa-9f9c-12c18f34e9ba',
        name: 'Manu',
      },
    },
    {
      name: 'Himmelblau | Root Flow',
      start: new Date('2026-04-20T10:00:00+02:00'),
      end: new Date('2026-04-20T11:00:00+02:00'),
      color: '#4fc1e9',
      teacher: {
        id: 'e4c1aac7-cf62-4766-82b6-126525c8dd7c',
        name: 'Rhina',
      },
    },
    {
      name: 'Abendrot | Grow Flow',
      start: new Date('2026-04-20T18:00:00+02:00'),
      end: new Date('2026-04-20T19:15:00+02:00'),
      color: '#e9573f',
      teacher: {
        id: '8463a22f-afa5-4afa-9f9c-12c18f34e9ba',
        name: 'Manu',
      },
    },
    {
      name: 'Himmelblau | Root Flow',
      start: new Date('2026-04-20T16:30:00+02:00'),
      end: new Date('2026-04-20T17:30:00+02:00'),
      color: '#4fc1e9',
      teacher: {
        id: '4a9125b8-4e7e-4af5-88d4-86e070f0e009',
        name: 'Aileen',
      },
    },
    {
      name: 'Rosa Wolken | Yin',
      start: new Date('2026-04-20T19:45:00+02:00'),
      end: new Date('2026-04-20T20:45:00+02:00'),
      color: '#df83b6',
      teacher: {
        id: '8463a22f-afa5-4afa-9f9c-12c18f34e9ba',
        name: 'Manu',
      },
    },
    {
      name: 'Himmelblau | Grow Flow',
      start: new Date('2026-04-21T16:30:00+02:00'),
      end: new Date('2026-04-21T17:30:00+02:00'),
      color: '#3bafda',
      teacher: {
        id: '8463a22f-afa5-4afa-9f9c-12c18f34e9ba',
        name: 'Manu',
      },
    },
    {
      name: 'Abendrot | Root Flow',
      start: new Date('2026-04-21T18:00:00+02:00'),
      end: new Date('2026-04-21T19:15:00+02:00'),
      color: '#fc6e51',
      teacher: {
        id: '4a9125b8-4e7e-4af5-88d4-86e070f0e009',
        name: 'Aileen',
      },
    },
    {
      name: 'Rosa Wolken | Yin',
      start: new Date('2026-04-21T19:45:00+02:00'),
      end: new Date('2026-04-21T20:45:00+02:00'),
      color: '#df83b6',
      teacher: {
        id: '4a9125b8-4e7e-4af5-88d4-86e070f0e009',
        name: 'Aileen',
      },
    },
    {
      name: 'Rosa Wolken | Yin',
      start: new Date('2026-04-22T16:30:00+02:00'),
      end: new Date('2026-04-22T17:30:00+02:00'),
      color: '#df83b6',
      teacher: {
        id: 'bb3a4886-d986-4355-8f67-050856d1b87a',
        name: 'Alexandra',
      },
    },
    {
      name: 'Abendrot | Root Flow',
      start: new Date('2026-04-22T18:00:00+02:00'),
      end: new Date('2026-04-22T19:00:00+02:00'),
      color: '#fc6e51',
      teacher: {
        id: 'bb3a4886-d986-4355-8f67-050856d1b87a',
        name: 'Alexandra',
      },
    },
    {
      name: 'Abendrot | Grow Flow',
      start: new Date('2026-04-22T19:30:00+02:00'),
      end: new Date('2026-04-22T20:30:00+02:00'),
      color: '#e9573f',
      teacher: {
        id: 'a6dff8ec-baa4-4386-b649-f9cb1fd464a2',
        name: 'Ali Kaan',
      },
    },
    {
      name: 'Himmelblau | Grow Flow',
      start: new Date('2026-04-23T16:30:00+02:00'),
      end: new Date('2026-04-23T17:30:00+02:00'),
      color: '#3bafda',
      teacher: {
        id: 'e4c1aac7-cf62-4766-82b6-126525c8dd7c',
        name: 'Rhina',
      },
    },
    {
      name: 'Abendrot | Root Flow',
      start: new Date('2026-04-23T18:00:00+02:00'),
      end: new Date('2026-04-23T19:00:00+02:00'),
      color: '#fc6e51',
      teacher: {
        id: '1f755400-8397-4bd0-965b-56fbe0921ed5',
        name: 'Maro (eng)',
      },
    },
    {
      name: 'Abendrot | Grow Flow',
      start: new Date('2026-04-23T19:30:00+02:00'),
      end: new Date('2026-04-23T20:30:00+02:00'),
      color: '#e9573f',
      teacher: {
        id: '1c8f10a2-f3f8-4de8-839e-5191c188836a',
        name: 'Josefine',
      },
    },
  ];

  currentWeek = getCurrentWeek();

  getEntriesForDayAndTimeOfDay(weekday: WeekdayInput, timeOfDay: TimeOfDay): TimetableEntry[] {
    return filterEntriesForTimeOfDay(filterEntriesForWeekday(this.timetable, weekday), timeOfDay);
  }
}
