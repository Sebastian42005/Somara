import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TimePipe } from '../../../pipes/time-pipe';
import { NgStyle } from '@angular/common';
import {
  getMinutesDifference,
  TimetableEntry,
} from '../models/timetable-entry.model';

@Component({
  selector: 'app-timetable-entry',
  imports: [
    MatIcon,
    TimePipe,
    NgStyle
  ],
  templateUrl: './timetable-entry.html',
})
export class TimetableEntryComponent {
  entry = input.required<TimetableEntry>();

  getDurationInMinutes(startDate: Date, endDate: Date): number {
    return getMinutesDifference(startDate, endDate);
  }
}
