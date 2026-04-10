import { DatePipe, NgStyle } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DialogSize } from '../dialog/enum/dialog-size';
import { apiBasePath, SomaraSignalStore } from '../core/store/somara-signal.store';
import { getMinutesDifference, TimetableEntry } from '../timetable/models/timetable-entry.model';
import { ProfilePicture } from '../components/profile-picture/profile-picture';

interface TeacherSummary {
  teacher: {
    id: number;
    name: string;
    description?: string | null;
  };
  entryCount: number;
  nextEntry: TimetableEntry | null;
}

@Component({
  selector: 'app-teachers',
  imports: [
    MatIconModule,
    DatePipe,
    NgStyle,
    ProfilePicture,
  ],
  templateUrl: './teachers.html',
  styleUrl: './teachers.scss',
})
export class Teachers {
  private readonly store = inject(SomaraSignalStore);
  private readonly dialog = inject(MatDialog);

  readonly activeOverview = signal<'teachers' | 'timetable'>('teachers');

  readonly teachers = this.store.teachers;
  readonly timetableEntries = this.store.timetableEntries;

  readonly isTeachersLoading = this.store.isTeachersLoading;
  readonly isTimetableLoading = this.store.isTimetableLoading;

  readonly isBusy = computed(() => this.isTeachersLoading() || this.isTimetableLoading());
  readonly errorMessage = computed(() => this.store.teachersError() ?? this.store.timetableError());

  readonly teacherCount = computed(() => this.teachers().length);
  readonly entryCount = computed(() => this.timetableEntries().length);
  readonly upcomingEntryCount = computed(() => this.getUpcomingEntries(this.sortedEntries()).length);

  readonly sortedEntries = computed(() =>
    [...this.timetableEntries()].sort((first, second) => first.start.getTime() - second.start.getTime()),
  );

  readonly overviewEntries = computed(() => {
    const sortedEntries = this.sortedEntries();
    const upcomingEntries = this.getUpcomingEntries(sortedEntries);

    if (upcomingEntries.length > 0) {
      return upcomingEntries;
    }

    return [...sortedEntries].reverse().slice(0, 15);
  });

  readonly teacherSummaries = computed<TeacherSummary[]>(() => {
    const now = Date.now();
    const entriesByTeacherId = new Map<number, TimetableEntry[]>();

    for (const entry of this.sortedEntries()) {
      const teacherEntries = entriesByTeacherId.get(entry.teacher.id) ?? [];
      teacherEntries.push(entry);
      entriesByTeacherId.set(entry.teacher.id, teacherEntries);
    }

    return this.teachers()
      .map((teacher) => {
        const teacherEntries = entriesByTeacherId.get(teacher.id) ?? [];
        const nextEntry = teacherEntries.find((entry) => entry.end.getTime() >= now) ?? null;

        return {
          teacher,
          entryCount: teacherEntries.length,
          nextEntry,
        };
      })
      .sort((first, second) => {
        if (first.entryCount !== second.entryCount) {
          return second.entryCount - first.entryCount;
        }

        return first.teacher.name.localeCompare(second.teacher.name);
      });
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

  async onCreateTeacherClick(): Promise<void> {
    const { CreateTeacherDialog } = await import(
      '../dialog/create-teacher-dialog/create-teacher-dialog'
    );

    const dialogRef = this.dialog.open(CreateTeacherDialog, {
      minWidth: DialogSize.SMALL.minWidth,
      maxWidth: DialogSize.SMALL.maxWidth,
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        void this.reloadData();
      }
    });
  }

  async onCreateEntryClick(): Promise<void> {
    const { CreateTimetableEntryDialog } = await import(
      '../dialog/create-timetable-entry-dialog/create-timetable-entry-dialog'
    );

    const dialogRef = this.dialog.open(CreateTimetableEntryDialog, {
      minWidth: DialogSize.MEDIUM.minWidth,
      maxWidth: DialogSize.MEDIUM.maxWidth,
      data: {
        initialDate: new Date(),
      },
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        void this.reloadData();
      }
    });
  }

  getTeacherProfilePicture(id: string) {
    return apiBasePath + `/teachers/${id}/profile-image`
  }


  getDurationInMinutes(entry: TimetableEntry): number {
    return getMinutesDifference(entry.start, entry.end);
  }

  showTeachersOverview(): void {
    this.activeOverview.set('teachers');
  }

  showTimetableOverview(): void {
    this.activeOverview.set('timetable');
  }

  private getUpcomingEntries(entries: TimetableEntry[]): TimetableEntry[] {
    const now = Date.now();
    return entries.filter((entry) => entry.end.getTime() >= now).slice(0, 15);
  }
}
