import { computed, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { merge } from 'rxjs';
import { ScheduleEntryLevel, ScheduleEntrySuggestionDto } from '../../core/models/timetable-entry.dto';
import { SomaraSignalStore } from '../../core/store/somara-signal.store';

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

interface CreateTimetableEntryDialogData {
  initialDate?: Date | null;
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

  readonly teachers = this.store.teachers;
  readonly colorSuggestions = this.store.timetableEntryColors;
  readonly levelOptions: ReadonlyArray<{ value: ScheduleEntryLevel; label: string }> = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all levels', label: 'All Levels' },
  ];

  readonly isTeachersLoading = this.store.isTeachersLoading;
  readonly isTimetableLoading = this.store.isTimetableLoading;
  readonly isTimetableColorsLoading = this.store.isTimetableColorsLoading;

  readonly isSubmitting = signal(false);
  readonly isBusy = computed(() =>
    this.isSubmitting()
    || this.isTimetableLoading()
    || this.isTeachersLoading(),
  );
  readonly errorMessage = computed(() =>
    this.localErrorSignal()
    ?? this.store.timetableError()
    ?? this.store.teachersError()
    ?? this.store.timetableColorsError(),
  );

  readonly entryForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(120)]],
      level: ['beginner' as ScheduleEntryLevel, [Validators.required]],
      teacherId: [0, [Validators.required, Validators.min(1)]],
      date: [this.normalizeDate(this.data?.initialDate ?? new Date()), [Validators.required]],
      startTime: ['08:00', [Validators.required, Validators.pattern(TIME_PATTERN)]],
      endTime: ['09:00', [Validators.required, Validators.pattern(TIME_PATTERN)]],
      durationMinutes: [60, [Validators.required, Validators.min(1), Validators.max(this.maxMinutesOfDay)]],
      color: ['#005F6A', [Validators.required, Validators.pattern(/^#([0-9a-fA-F]{6})$/)]],
    },
    { validators: [(control) => this.validateTimeRange(control)] },
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
      name,
      level,
      teacherId,
      date,
      startTime,
      endTime,
      color,
    } = this.entryForm.getRawValue();

    const normalizedName = name.trim();
    const normalizedColor = this.normalizeColorHex(color);

    if (normalizedName.length === 0 || normalizedColor === null) {
      this.localErrorSignal.set('Bitte pruefe Name und Farbe.');
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
      await this.store.createTimetableEntry({
        name: normalizedName,
        level,
        teacherId,
        start,
        end,
        color: normalizedColor,
      });
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

  applySuggestion(suggestion: ScheduleEntrySuggestionDto): void {
    const normalizedColor = this.normalizeColorHex(suggestion.colorHex);

    this.entryForm.patchValue({
      name: suggestion.name,
      color: normalizedColor ?? this.entryForm.controls.color.value,
    });
  }

  onColorPickerChange(value: string): void {
    const normalized = this.normalizeColorHex(value);
    if (normalized !== null) {
      this.entryForm.controls.color.setValue(normalized);
    }
  }

  getColorInputTextColor(colorValue: string): string {
    const normalized = this.normalizeColorHex(colorValue);
    if (normalized === null) {
      return '#111111';
    }

    const red = Number.parseInt(normalized.slice(1, 3), 16);
    const green = Number.parseInt(normalized.slice(3, 5), 16);
    const blue = Number.parseInt(normalized.slice(5, 7), 16);
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

    return luminance > 0.6 ? '#0f172a' : '#f8fafc';
  }

  private async loadInitialData(): Promise<void> {
    if (this.teachers().length === 0) {
      try {
        await this.store.loadTeachers();
      } catch {
        // Error state is managed in store and exposed in the template.
      }
    }

    if (this.colorSuggestions().length === 0) {
      try {
        await this.store.loadTimetableEntryColors();
      } catch {
        // Suggestion loading errors are optional; dialog stays usable.
      }
    }

    const [firstTeacher] = this.teachers();
    if (firstTeacher && this.entryForm.controls.teacherId.value === 0) {
      this.entryForm.controls.teacherId.setValue(firstTeacher.id);
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

  private normalizeColorHex(value: string): string | null {
    const rawValue = value.trim();

    if (rawValue.length === 0) {
      return null;
    }

    const withHash = rawValue.startsWith('#') ? rawValue : `#${rawValue}`;

    if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
      return withHash.toUpperCase();
    }

    if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
      const [, red, green, blue] = withHash;
      return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
    }

    return null;
  }
}
