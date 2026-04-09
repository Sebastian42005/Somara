import { NgStyle } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { WeekdayPipe } from '../../pipes/weekday-pipe';
import { SomaraSignalStore } from '../core/store/somara-signal.store';
import { createDayEntryFromDate, DayEntry, getWeekForDate } from './models/day-entry.model';
import {
  filterEntriesForTimeOfDay,
  TimeOfDay,
  TimetableEntry,
} from './models/timetable-entry.model';
import { TimetableEntryComponent } from './timetable-entry/timetable-entry';

@Component({
  selector: 'app-timetable',
  imports: [
    WeekdayPipe,
    MatIconModule,
    TimetableEntryComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    NgStyle,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './timetable.html',
  styleUrl: './timetable.scss',
})
export class Timetable {
  private readonly store = inject(SomaraSignalStore);

  readonly timeOfDaySections: ReadonlyArray<{ key: TimeOfDay; label: string; icon: string; backgroundColor: string }> = [
    { key: 'morning', label: 'Morgens', icon: 'wb_twilight', backgroundColor: 'var(--somara-time-morning-bg)' },
    { key: 'midday', label: 'Mittags', icon: 'wb_sunny', backgroundColor: 'var(--somara-time-midday-bg)' },
    { key: 'afternoon', label: 'Nachmittags', icon: 'wb_twilight', backgroundColor: 'var(--somara-time-afternoon-bg)' },
    { key: 'evening', label: 'Abends', icon: 'nights_stay', backgroundColor: 'var(--somara-time-evening-bg)' },
  ];

  readonly weekReferenceDate = signal<Date>(this.normalizeDate(new Date()) ?? new Date());
  readonly currentWeek = computed<DayEntry[]>(() => getWeekForDate(this.weekReferenceDate()));
  readonly selectedDate = signal<Date | null>(null);
  readonly visibleDays = computed<DayEntry[]>(() => {
    const selectedDate = this.selectedDate();
    return selectedDate ? [createDayEntryFromDate(selectedDate)] : this.currentWeek();
  });
  readonly daysGridStyle = computed(() => ({
    'grid-template-columns': `repeat(${this.visibleDays().length}, minmax(0, 1fr))`,
  }));

  readonly timetable = this.store.timetableEntries;
  readonly isScheduleLoading = this.store.isScheduleLoading;
  readonly scheduleError = this.store.scheduleError;

  constructor() {
    void this.reloadScheduleEntries();
  }

  async reloadScheduleEntries(): Promise<void> {
    try {
      await this.store.loadScheduleEntries();
    } catch {
      // Error state is already set in store and shown in the template.
    }
  }

  onDateSelected(date: Date | null): void {
    const normalizedDate = this.normalizeDate(date);
    this.selectedDate.set(normalizedDate);

    if (normalizedDate !== null) {
      this.weekReferenceDate.set(normalizedDate);
    }
  }

  clearDateSelection(): void {
    this.selectedDate.set(null);
  }

  showPreviousWeek(): void {
    this.shiftWeek(-1);
  }

  showNextWeek(): void {
    this.shiftWeek(1);
  }

  getEntriesForDayAndTimeOfDay(day: DayEntry, timeOfDay: TimeOfDay): TimetableEntry[] {
    const entriesForDay = this.filterEntriesForDate(this.timetable(), day.value);

    return filterEntriesForTimeOfDay(entriesForDay, timeOfDay);
  }

  private filterEntriesForDate(entries: TimetableEntry[], date: Date): TimetableEntry[] {
    return entries
      .filter((entry) => this.isSameCalendarDate(entry.start, date))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  private isSameCalendarDate(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear()
      && first.getMonth() === second.getMonth()
      && first.getDate() === second.getDate();
  }

  private shiftWeek(weekOffset: number): void {
    const daysToShift = weekOffset * 7;
    this.weekReferenceDate.update((date) => this.addDays(date, daysToShift));

    const selectedDate = this.selectedDate();
    if (selectedDate !== null) {
      this.selectedDate.set(this.addDays(selectedDate, daysToShift));
    }
  }

  private addDays(date: Date, daysToShift: number): Date {
    const shiftedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    shiftedDate.setDate(shiftedDate.getDate() + daysToShift);
    return shiftedDate;
  }

  private normalizeDate(date: Date | null): Date | null {
    if (date === null) {
      return null;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
