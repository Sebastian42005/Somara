import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SomaraSignalStore } from '../core/store/somara-signal.store';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly store = inject(SomaraSignalStore);
  private readonly fb = inject(FormBuilder);

  readonly successMessage = signal<string | null>(null);
  readonly role = computed(() => this.store.auth()?.role ?? '');

  readonly profileForm = this.fb.nonNullable.group({
    username: [this.store.auth()?.username ?? '', [Validators.required]],
  });

  readonly isUsernameInvalid = computed(() => {
    const usernameControl = this.profileForm.controls.username;
    return usernameControl.invalid && (usernameControl.dirty || usernameControl.touched);
  });

  saveProfile(): void {
    this.successMessage.set(null);

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const username = this.profileForm.controls.username.getRawValue().trim();
    if (username.length === 0) {
      this.profileForm.controls.username.markAsTouched();
      return;
    }

    this.store.updateProfile({ username });
    this.successMessage.set('Profil wurde gespeichert.');
  }
}
