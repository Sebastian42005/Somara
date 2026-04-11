import { DatePipe, NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfilePicture } from '../../../components/profile-picture/profile-picture';
import { getMinutesDifference, TimetableEntry } from '../../../timetable/models/timetable-entry.model';

@Component({
  selector: 'app-admin-timetable-tab',
  imports: [
    DatePipe,
    NgStyle,
    MatIconModule,
    ProfilePicture,
  ],
  templateUrl: './admin-timetable-tab.html',
  styleUrl: './admin-timetable-tab.scss',
})
export class AdminTimetableTab {
  readonly overviewEntries = input.required<TimetableEntry[]>();
  readonly isTimetableLoading = input.required<boolean>();
  readonly isBusy = input.required<boolean>();

  readonly editEntry = output<TimetableEntry>();

  getDurationInMinutes(entry: TimetableEntry): number {
    return getMinutesDifference(entry.start, entry.end);
  }

  onEditEntryClick(entry: TimetableEntry): void {
    this.editEntry.emit(entry);
  }
}
