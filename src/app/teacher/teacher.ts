import { DatePipe, NgStyle } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfilePicture } from '../components/profile-picture/profile-picture';
import { SomaraSignalStore } from '../core/store/somara-signal.store';
import { ScheduleEntryLevel } from '../core/models/timetable-entry.dto';
import { getMinutesDifference, Teacher as TimetableTeacher, TimetableEntry } from '../timetable/models/timetable-entry.model';

interface TeacherScheduleDay {
  isoDate: string;
  date: Date;
  entries: TimetableEntry[];
  totalMinutes: number;
}

@Component({
  selector: 'app-teacher',
  imports: [MatIconModule, DatePipe, NgStyle, ProfilePicture],
  templateUrl: './teacher.html',
  styleUrl: './teacher.scss',
})
export class Teacher {
  private readonly store = inject(SomaraSignalStore);

  readonly isTimetableLoading = this.store.isTimetableLoading;
  readonly isTeachersLoading = this.store.isTeachersLoading;
  readonly isBusy = computed(() => this.isTimetableLoading() || this.isTeachersLoading());
  readonly errorMessage = computed(() => this.store.timetableError() ?? this.store.teachersError());

  private readonly normalizedUsername = computed(() =>
    this.store.auth()?.username.trim().toLowerCase() ?? '',
  );
  private readonly upcomingEntries = computed(() =>
    this.sortEntries(this.store.timetableEntries().filter((entry) => entry.end.getTime() >= Date.now())),
  );
  private readonly teacherId = computed<number | null>(() => {
    const username = this.normalizedUsername();
    const teachers = this.store.teachers();

    if (username.length > 0) {
      const teacherByName = teachers.find(
        (teacher) => this.normalizeForComparison(teacher.name) === username,
      );

      if (teacherByName) {
        return teacherByName.id;
      }
    }

    if (username.length > 0) {
      const teacherFromEntry = this.upcomingEntries().find(
        (entry) => this.normalizeForComparison(entry.teacher.name) === username,
      );

      if (teacherFromEntry) {
        return teacherFromEntry.teacher.id;
      }
    }

    const distinctTeacherIds = Array.from(
      new Set(this.upcomingEntries().map((entry) => entry.teacher.id)),
    );

    return distinctTeacherIds.length === 1 ? distinctTeacherIds[0] : null;
  });

  readonly teacherEntries = computed(() => {
    const teacherId = this.teacherId();
    if (teacherId === null) {
      return [];
    }

    return this.upcomingEntries().filter((entry) => entry.teacher.id === teacherId);
  });
  readonly teacherProfile = computed<TimetableTeacher | null>(() => {
    const teacherId = this.teacherId();
    if (teacherId === null) {
      return null;
    }

    const teacherFromDirectory = this.store.teachers().find((teacher) => teacher.id === teacherId);
    if (teacherFromDirectory) {
      return teacherFromDirectory;
    }

    return this.teacherEntries().find((entry) => entry.teacher.id === teacherId)?.teacher ?? null;
  });
  readonly teacherDisplayName = computed(() =>
    this.teacherProfile()?.name ?? this.store.auth()?.username ?? 'Lehrer',
  );

  readonly hasTeacherMapping = computed(() => this.teacherId() !== null);
  readonly nextEntry = computed(() => this.teacherEntries()[0] ?? null);
  readonly nextEntryRelativeText = computed(() => {
    const nextEntry = this.nextEntry();
    return nextEntry ? this.toRelativeStartText(nextEntry.start) : 'Keine geplante Stunde';
  });
  readonly groupedSchedule = computed<TeacherScheduleDay[]>(() => {
    const groups = new Map<string, TeacherScheduleDay>();

    for (const entry of this.teacherEntries()) {
      const isoDate = this.toIsoDateKey(entry.start);
      const currentGroup = groups.get(isoDate);
      const durationInMinutes = this.getDurationInMinutes(entry);

      if (currentGroup) {
        currentGroup.entries.push(entry);
        currentGroup.totalMinutes += durationInMinutes;
        continue;
      }

      groups.set(isoDate, {
        isoDate,
        date: new Date(entry.start.getFullYear(), entry.start.getMonth(), entry.start.getDate()),
        entries: [entry],
        totalMinutes: durationInMinutes,
      });
    }

    return Array.from(groups.values()).sort((first, second) => first.date.getTime() - second.date.getTime());
  });

  readonly upcomingCount = computed(() => this.teacherEntries().length);
  readonly teachingDayCount = computed(() => this.groupedSchedule().length);
  readonly upcomingMinutes = computed(() =>
    this.teacherEntries().reduce((total, entry) => total + this.getDurationInMinutes(entry), 0),
  );
  readonly nextSevenDaysMinutes = computed(() => {
    const now = Date.now();
    const nextWeekBoundary = now + 7 * 24 * 60 * 60 * 1000;

    return this.teacherEntries()
      .filter((entry) => entry.start.getTime() >= now && entry.start.getTime() < nextWeekBoundary)
      .reduce((total, entry) => total + this.getDurationInMinutes(entry), 0);
  });

  constructor() {
    void this.reloadData();
  }

  async reloadData(): Promise<void> {
    this.store.clearErrors();

    await Promise.allSettled([
      this.store.loadTeachers(),
      this.store.loadTimetableEntries(),
    ]);
  }

  getDurationInMinutes(entry: TimetableEntry): number {
    return getMinutesDifference(entry.start, entry.end);
  }

  formatLevel(level: ScheduleEntryLevel): string {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'advanced':
        return 'Advanced';
      default:
        return 'Alle Level';
    }
  }

  private normalizeForComparison(value: string): string {
    return value.trim().toLowerCase();
  }

  private sortEntries(entries: TimetableEntry[]): TimetableEntry[] {
    return [...entries].sort((first, second) => first.start.getTime() - second.start.getTime());
  }

  private toIsoDateKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toRelativeStartText(start: Date): string {
    const minutesUntilStart = Math.ceil((start.getTime() - Date.now()) / 60000);

    if (minutesUntilStart <= 0) {
      return 'Startet jetzt';
    }

    if (minutesUntilStart < 60) {
      return `In ${minutesUntilStart} Min`;
    }

    const hoursUntilStart = Math.floor(minutesUntilStart / 60);
    if (hoursUntilStart < 24) {
      return `In ${hoursUntilStart} Std`;
    }

    const daysUntilStart = Math.floor(hoursUntilStart / 24);
    return daysUntilStart === 1 ? 'In 1 Tag' : `In ${daysUntilStart} Tagen`;
  }
}
