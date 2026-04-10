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
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private readonly store = inject(SomaraSignalStore);
  private readonly dialog = inject(MatDialog);

  readonly activeOverview = signal<'teachers' | 'timetable' | 'classes'>('teachers');

  readonly teachers = this.store.teachers;
  readonly classes = this.store.classes;
  readonly timetableEntries = this.store.timetableEntries;

  readonly isTeachersLoading = this.store.isTeachersLoading;
  readonly isClassesLoading = this.store.isClassesLoading;
  readonly isTimetableLoading = this.store.isTimetableLoading;

  readonly isBusy = computed(() =>
    this.isTeachersLoading()
    || this.isClassesLoading()
    || this.isTimetableLoading(),
  );
  readonly errorMessage = computed(() =>
    this.store.teachersError()
    ?? this.store.classesError()
    ?? this.store.timetableError(),
  );

  readonly teacherCount = computed(() => this.teachers().length);
  readonly classCount = computed(() => this.classes().length);
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
      this.store.loadClasses(),
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

  async onCreateClassClick(): Promise<void> {
    const { CreateClassDialog } = await import(
      '../dialog/create-class-dialog/create-class-dialog'
    );

    const dialogRef = this.dialog.open(CreateClassDialog, {
      minWidth: DialogSize.SMALL.minWidth,
      maxWidth: DialogSize.SMALL.maxWidth,
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        void this.reloadData();
      }
    });
  }

  getDurationInMinutes(entry: TimetableEntry): number {
    return getMinutesDifference(entry.start, entry.end);
  }

  getClassImageUrl(classId: number): string {
    return `${apiBasePath}/yoga-classes/${classId}/image`;
  }

  showTeachersOverview(): void {
    this.activeOverview.set('teachers');
  }

  showTimetableOverview(): void {
    this.activeOverview.set('timetable');
  }

  showClassesOverview(): void {
    this.activeOverview.set('classes');
  }

  private getUpcomingEntries(entries: TimetableEntry[]): TimetableEntry[] {
    const now = Date.now();
    return entries.filter((entry) => entry.end.getTime() >= now).slice(0, 15);
  }
}
