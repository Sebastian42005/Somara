import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SomaraSignalStore } from '../../core/store/somara-signal.store';

const MAX_PROFILE_IMAGE_BYTES = 4 * 1024 * 1024;

@Component({
  selector: 'app-create-teacher-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './create-teacher-dialog.html',
  styleUrl: './create-teacher-dialog.scss',
})
export class CreateTeacherDialog {
  private readonly store = inject(SomaraSignalStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<CreateTeacherDialog>);

  private readonly localErrorSignal = signal<string | null>(null);
  private readonly selectedProfileImageFileSignal = signal<File | null>(null);
  private readonly profileImagePreviewUrlSignal = signal<string | null>(null);

  readonly isTeachersLoading = this.store.isTeachersLoading;
  readonly isSubmitting = signal(false);
  readonly isBusy = computed(() => this.isSubmitting() || this.isTeachersLoading());
  readonly errorMessage = computed(() => this.localErrorSignal() ?? this.store.teachersError());

  readonly teacherForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  readonly profileImagePreview = computed(() => this.profileImagePreviewUrlSignal());
  readonly selectedProfileImageName = computed(() => this.selectedProfileImageFileSignal()?.name ?? null);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.revokeProfileImagePreviewUrl();
    });
  }

  async submit(): Promise<void> {
    this.localErrorSignal.set(null);
    this.store.clearErrors();

    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    const { name, description } = this.teacherForm.getRawValue();
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const selectedProfileImage = this.selectedProfileImageFileSignal();

    if (normalizedName.length === 0) {
      this.localErrorSignal.set('Bitte gib einen gültigen Namen ein.');
      return;
    }

    if (normalizedDescription.length === 0) {
      this.localErrorSignal.set('Bitte gib eine Beschreibung ein.');
      return;
    }

    if (selectedProfileImage === null) {
      this.localErrorSignal.set('Bitte wähle ein Profilbild aus.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      await this.store.createTeacher({
        name: normalizedName,
        description: normalizedDescription,
        profileImage: selectedProfileImage,
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

  onProfileImageSelected(event: Event): void {
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

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      this.localErrorSignal.set('Das Profilbild darf maximal 4 MB groß sein.');
      if (input) {
        input.value = '';
      }
      return;
    }

    this.selectedProfileImageFileSignal.set(file);
    this.setProfileImagePreview(file);
    this.localErrorSignal.set(null);

    if (input) {
      input.value = '';
    }
  }

  clearProfileImage(fileInput: HTMLInputElement): void {
    this.selectedProfileImageFileSignal.set(null);
    this.revokeProfileImagePreviewUrl();
    this.localErrorSignal.set(null);
    fileInput.value = '';
  }

  private setProfileImagePreview(file: File): void {
    this.revokeProfileImagePreviewUrl();
    const objectUrl = URL.createObjectURL(file);
    this.profileImagePreviewUrlSignal.set(objectUrl);
  }

  private revokeProfileImagePreviewUrl(): void {
    const currentPreviewUrl = this.profileImagePreviewUrlSignal();
    if (currentPreviewUrl !== null) {
      URL.revokeObjectURL(currentPreviewUrl);
      this.profileImagePreviewUrlSignal.set(null);
    }
  }
}
