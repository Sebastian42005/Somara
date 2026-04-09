import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SomaraSignalStore } from '../../../core/store/somara-signal.store';

type AuthMode = 'login' | 'register';

interface AuthDialogData {
  initialMode?: AuthMode;
}

@Component({
  selector: 'app-auth-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,

  ],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.scss',
})
export class AuthDialog {
  private readonly store = inject(SomaraSignalStore);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AuthDialog>);
  private readonly data = inject<AuthDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  readonly mode = signal<AuthMode>(this.data?.initialMode ?? 'login');
  readonly isLoading = this.store.isAuthLoading;

  private readonly localErrorSignal = signal<string | null>(null);
  readonly errorMessage = computed(() => this.localErrorSignal() ?? this.store.authError());

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  setMode(mode: AuthMode): void {
    if (this.mode() === mode) {
      return;
    }

    this.mode.set(mode);
    this.localErrorSignal.set(null);
    this.store.clearErrors();
  }

  onTabChange(index: number): void {
    this.setMode(index === 0 ? 'login' : 'register');
  }

  async submit(): Promise<void> {
    this.localErrorSignal.set(null);
    this.store.clearErrors();

    if (this.mode() === 'login') {
      if (this.loginForm.invalid) {
        this.loginForm.markAllAsTouched();
        return;
      }

      try {
        await this.store.login(this.loginForm.getRawValue());
        this.dialogRef.close(true);
      } catch {
        // Error state is handled in store and displayed in template.
      }

      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, password, confirmPassword } = this.registerForm.getRawValue();

    if (password !== confirmPassword) {
      this.localErrorSignal.set('Passwoerter stimmen nicht ueberein.');
      return;
    }

    try {
      await this.store.register({ username, password });
      this.dialogRef.close(true);
    } catch {
      // Error state is handled in store and displayed in template.
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
