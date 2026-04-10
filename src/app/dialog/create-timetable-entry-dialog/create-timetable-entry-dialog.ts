import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { map, merge, startWith } from 'rxjs';
import { ScheduleEntryLevel } from '../../core/models/timetable-entry.dto';
import { SomaraSignalStore } from '../../core/store/somara-signal.store';
import { TimetableEntryComponent } from '../../timetable/timetable-entry/timetable-entry';
import { getMinutesDifference, TimetableEntry } from '../../timetable/models/timetable-entry.model';

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

interface CreateTimetableEntryDialogData {
  initialDate?: Date | null;
  entry?: TimetableEntry | null;
}

@Component({
  selector: 'app-create-timetable-entry-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    TimetableEntryComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-timetable-entry-dialog.html',
  styleUrl: './create-timetable-entry-dialog.scss',
})
export class CreateTimetableEntryDialog {
  private readonly store = inject(SomaraSignalStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<CreateTimetableEntryDialog>);
  private readonly data = inject<CreateTimetableEntryDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  private readonly localErrorSignal = signal<string | null>(null);
  private isApplyingDerivedUpdate = false;
  private readonly maxMinutesOfDay = 23 * 60 + 59;
  private readonly editEntry = this.data?.entry ?? null;

  readonly teachers = this.store.teachers;
  readonly classes = this.store.classes;
  readonly levelOptions: ReadonlyArray<{ value: ScheduleEntryLevel; label: string }> = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all levels', label: 'All Levels' },
  ];

  readonly isTeachersLoading = this.store.isTeachersLoading;
  readonly isClassesLoading = this.store.isClassesLoading;
  readonly isTimetableLoading = this.store.isTimetableLoading;

  readonly isSubmitting = signal(false);
  readonly isBusy = computed(() =>
    this.isSubmitting()
    || this.isTimetableLoading()
    || this.isTeachersLoading()
    || this.isClassesLoading(),
  );
  readonly errorMessage = computed(() =>
    this.localErrorSignal()
    ?? this.store.timetableError()
    ?? this.store.teachersError()
    ?? this.store.classesError(),
  );
  readonly isEditMode = computed(() => this.editEntry !== null);
  readonly dialogTitle = computed(() => this.isEditMode() ? 'Stundenplan-Eintrag bearbeiten' : 'Neuen Timetable-Eintrag erstellen');
  readonly submitButtonLabel = computed(() => this.isEditMode() ? 'Eintrag speichern' : 'Eintrag erstellen');

  readonly entryForm = this.fb.nonNullable.group(
    {
      level: [this.editEntry?.level ?? 'beginner' as ScheduleEntryLevel, [Validators.required]],
      teacherId: [this.editEntry?.teacher.id ?? 0, [Validators.required, Validators.min(1)]],
      yogaClassId: [this.editEntry?.yogaClass.id ?? 0, [Validators.required, Validators.min(1)]],
      date: [this.normalizeDate(this.editEntry?.start ?? this.data?.initialDate ?? new Date()), [Validators.required]],
      startTime: [this.editEntry ? this.toTimeString(this.editEntry.start) : '08:00', [Validators.required, Validators.pattern(TIME_PATTERN)]],
      endTime: [this.editEntry ? this.toTimeString(this.editEntry.end) : '09:00', [Validators.required, Validators.pattern(TIME_PATTERN)]],
      durationMinutes: [
        this.editEntry ? Math.max(1, getMinutesDifference(this.editEntry.start, this.editEntry.end)) : 60,
        [Validators.required, Validators.min(1), Validators.max(this.maxMinutesOfDay)],
      ],
    },
    { validators: [(control) => this.validateTimeRange(control)] },
  );
  private readonly formValuesSignal = toSignal(
    this.entryForm.valueChanges.pipe(
      map(() => this.entryForm.getRawValue()),
      startWith(this.entryForm.getRawValue()),
    ),
    { initialValue: this.entryForm.getRawValue() },
  );
  readonly previewEntry = computed<TimetableEntry | null>(() => {
    const { level, teacherId, yogaClassId, date, startTime, endTime } = this.formValuesSignal();
    const selectedTeacher = this.teachers().find((teacher) => teacher.id === teacherId) ?? null;
    const selectedClass = this.classes().find((classItem) => classItem.id === yogaClassId) ?? null;

    if (!selectedTeacher || !selectedClass || !date) {
      return null;
    }

    const className = selectedClass.name.trim();
    if (className.length === 0) {
      return null;
    }

    const start = this.combineDateAndTime(date, startTime);
    const end = this.combineDateAndTime(date, endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return null;
    }

    return {
      id: this.editEntry?.id ?? 0,
      name: className,
      start,
      end,
      color: selectedClass.color,
      yogaClass: {
        id: selectedClass.id,
        name: selectedClass.name,
        color: selectedClass.color,
      },
      level,
      teacher: selectedTeacher,
    };
  });
  readonly canSubmit = computed(() =>
    !this.isBusy()
    && this.entryForm.valid
    && this.previewEntry() !== null,
  );

  constructor() {
    this.connectTimeDerivation();
    void this.loadInitialData();
  }

  async submit(): Promise<void> {
    this.localErrorSignal.set(null);
    this.store.clearErrors();

    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    const {
      level,
      teacherId,
      yogaClassId,
      date,
      startTime,
      endTime,
    } = this.entryForm.getRawValue();

    if (yogaClassId < 1) {
      this.localErrorSignal.set('Bitte waehle eine Klasse aus.');
      return;
    }

    const selectedClass = this.classes().find((classItem) => classItem.id === yogaClassId) ?? null;
    const derivedName = selectedClass?.name.trim() ?? '';

    if (selectedClass === null || derivedName.length === 0) {
      this.localErrorSignal.set('Bitte pruefe die ausgewaehlte Klasse.');
      return;
    }

    const start = this.combineDateAndTime(date, startTime);
    const end = this.combineDateAndTime(date, endTime);

    if (end <= start) {
      this.localErrorSignal.set('Die Endzeit muss spaeter als die Startzeit sein.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const payload = {
        name: derivedName,
        level,
        teacherId,
        yogaClassId,
        start,
        end,
      };

      if (this.editEntry) {
        await this.store.updateTimetableEntry(this.editEntry.id, payload);
      } else {
        await this.store.createTimetableEntry(payload);
      }

      this.dialogRef.close(true);
    } catch {
      // Error state is managed in store and exposed in the template.
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  private async loadInitialData(): Promise<void> {
    if (this.teachers().length === 0) {
      try {
        await this.store.loadTeachers();
      } catch {
        // Error state is managed in store and exposed in the template.
      }
    }

    if (this.classes().length === 0) {
      try {
        await this.store.loadClasses();
      } catch {
        // Error state is managed in store and exposed in the template.
      }
    }

    const [firstTeacher] = this.teachers();
    if (firstTeacher && this.entryForm.controls.teacherId.value === 0) {
      this.entryForm.controls.teacherId.setValue(firstTeacher.id);
    }

    const [firstClass] = this.classes();
    if (firstClass && this.entryForm.controls.yogaClassId.value === 0) {
      this.entryForm.controls.yogaClassId.setValue(firstClass.id);
    }
  }

  private connectTimeDerivation(): void {
    merge(
      this.entryForm.controls.startTime.valueChanges,
      this.entryForm.controls.endTime.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateDurationFromStartAndEnd());

    this.entryForm.controls.durationMinutes.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((durationMinutes) => this.updateEndFromDuration(durationMinutes));
  }

  private updateDurationFromStartAndEnd(): void {
    if (this.isApplyingDerivedUpdate) {
      return;
    }

    const startMinutes = this.parseTimeToMinutes(this.entryForm.controls.startTime.value);
    const endMinutes = this.parseTimeToMinutes(this.entryForm.controls.endTime.value);

    if (startMinutes === null || endMinutes === null) {
      return;
    }

    const computedDuration = Math.max(0, endMinutes - startMinutes);
    if (this.entryForm.controls.durationMinutes.value === computedDuration) {
      return;
    }

    this.withDerivedUpdateGuard(() => {
      this.entryForm.controls.durationMinutes.setValue(computedDuration, { emitEvent: false });
      this.entryForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  private updateEndFromDuration(durationMinutes: number): void {
    if (this.isApplyingDerivedUpdate) {
      return;
    }

    if (!Number.isFinite(durationMinutes)) {
      return;
    }

    const startMinutes = this.parseTimeToMinutes(this.entryForm.controls.startTime.value);

    if (startMinutes === null) {
      return;
    }

    const safeDuration = Math.max(1, Math.floor(durationMinutes));
    const computedEndMinutes = Math.min(startMinutes + safeDuration, this.maxMinutesOfDay);
    const appliedDuration = computedEndMinutes - startMinutes;
    const computedEndTime = this.minutesToTimeString(computedEndMinutes);

    this.withDerivedUpdateGuard(() => {
      this.entryForm.controls.endTime.setValue(computedEndTime, { emitEvent: false });

      if (this.entryForm.controls.durationMinutes.value !== appliedDuration) {
        this.entryForm.controls.durationMinutes.setValue(appliedDuration, { emitEvent: false });
      }

      this.entryForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  private withDerivedUpdateGuard(update: () => void): void {
    this.isApplyingDerivedUpdate = true;

    try {
      update();
    } finally {
      this.isApplyingDerivedUpdate = false;
    }
  }

  private validateTimeRange(control: AbstractControl): ValidationErrors | null {
    const startTimeControl = control.get('startTime');
    const endTimeControl = control.get('endTime');

    if (!startTimeControl || !endTimeControl) {
      return null;
    }

    const startMinutes = this.parseTimeToMinutes(startTimeControl.value as string);
    const endMinutes = this.parseTimeToMinutes(endTimeControl.value as string);

    if (startMinutes === null || endMinutes === null) {
      return null;
    }

    return endMinutes > startMinutes ? null : { invalidTimeRange: true };
  }

  private combineDateAndTime(date: Date, timeString: string): Date {
    const [hour, minute] = timeString.split(':').map((value) => Number.parseInt(value, 10));
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute,
      0,
      0,
    );
  }

  private parseTimeToMinutes(value: string): number | null {
    const normalized = value.trim();

    if (!TIME_PATTERN.test(normalized)) {
      return null;
    }

    const [hour, minute] = normalized.split(':').map((segment) => Number.parseInt(segment, 10));
    return hour * 60 + minute;
  }

  private minutesToTimeString(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private normalizeDate(value: Date | null): Date {
    const date = value ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toTimeString(value: Date): string {
    const hours = value.getHours().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

}
