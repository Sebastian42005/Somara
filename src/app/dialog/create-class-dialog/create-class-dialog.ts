import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SomaraSignalStore } from '../../core/store/somara-signal.store';

const MAX_CLASS_IMAGE_BYTES = 4 * 1024 * 1024;

@Component({
  selector: 'app-create-class-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './create-class-dialog.html',
  styleUrl: './create-class-dialog.scss',
})
export class CreateClassDialog {
  private readonly store = inject(SomaraSignalStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<CreateClassDialog>);

  private readonly localErrorSignal = signal<string | null>(null);
  private readonly selectedClassImageFileSignal = signal<File | null>(null);
  private readonly classImagePreviewUrlSignal = signal<string | null>(null);

  readonly isClassesLoading = this.store.isClassesLoading;
  readonly isSubmitting = signal(false);
  readonly isBusy = computed(() => this.isSubmitting() || this.isClassesLoading());
  readonly errorMessage = computed(() => this.localErrorSignal() ?? this.store.classesError());

  readonly classForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    color: ['#0F766E', [Validators.required, Validators.pattern(/^#([0-9a-fA-F]{6})$/)]],
  });

  readonly classImagePreview = computed(() => this.classImagePreviewUrlSignal());
  readonly selectedClassImageName = computed(() => this.selectedClassImageFileSignal()?.name ?? null);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.revokeClassImagePreviewUrl();
    });
  }

  async submit(): Promise<void> {
    this.localErrorSignal.set(null);
    this.store.clearErrors();

    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    const { name, description, color } = this.classForm.getRawValue();
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const normalizedColor = this.normalizeColorHex(color);

    if (normalizedName.length === 0) {
      this.localErrorSignal.set('Bitte gib einen gültigen Namen ein.');
      return;
    }

    if (normalizedDescription.length === 0) {
      this.localErrorSignal.set('Bitte gib eine Beschreibung ein.');
      return;
    }

    if (normalizedColor === null) {
      this.localErrorSignal.set('Bitte gib eine gültige Farbe im Format #RRGGBB ein.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      await this.store.createClass({
        name: normalizedName,
        description: normalizedDescription,
        color: normalizedColor,
        image: this.selectedClassImageFileSignal() ?? undefined,
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

  onClassImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;

    if (file === null) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.localErrorSignal.set('Bitte wähle eine Bilddatei aus.');
      if (input) {
        input.value = '';
      }
      return;
    }

    if (file.size > MAX_CLASS_IMAGE_BYTES) {
      this.localErrorSignal.set('Das Bild darf maximal 4 MB groß sein.');
      if (input) {
        input.value = '';
      }
      return;
    }

    this.selectedClassImageFileSignal.set(file);
    this.setClassImagePreview(file);
    this.localErrorSignal.set(null);

    if (input) {
      input.value = '';
    }
  }

  clearClassImage(fileInput: HTMLInputElement): void {
    this.selectedClassImageFileSignal.set(null);
    this.revokeClassImagePreviewUrl();
    this.localErrorSignal.set(null);
    fileInput.value = '';
  }

  onColorPickerChange(value: string): void {
    const normalized = this.normalizeColorHex(value);

    if (normalized !== null) {
      this.classForm.controls.color.setValue(normalized);
      this.localErrorSignal.set(null);
    }
  }

  private setClassImagePreview(file: File): void {
    this.revokeClassImagePreviewUrl();
    const objectUrl = URL.createObjectURL(file);
    this.classImagePreviewUrlSignal.set(objectUrl);
  }

  private revokeClassImagePreviewUrl(): void {
    const currentPreviewUrl = this.classImagePreviewUrlSignal();
    if (currentPreviewUrl !== null) {
      URL.revokeObjectURL(currentPreviewUrl);
      this.classImagePreviewUrlSignal.set(null);
    }
  }

  private normalizeColorHex(value: string): string | null {
    const trimmedValue = value.trim();
    const normalizedValue = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
    return /^#([0-9a-fA-F]{6})$/.test(normalizedValue) ? normalizedValue.toUpperCase() : null;
  }
}
