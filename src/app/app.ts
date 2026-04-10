import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthDialog } from './dialog/auth/auth-dialog/auth-dialog';
import { SomaraSignalStore } from './core/store/somara-signal.store';
import { ProfilePicture } from './components/profile-picture/profile-picture';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    ProfilePicture,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(SomaraSignalStore);

  protected readonly title = signal('Somara');
  protected readonly isAuthenticated = this.store.isAuthenticated;
  protected readonly username = computed(() => this.store.auth()?.username ?? '');
  protected readonly isAdmin = computed(() => this.store.auth()?.role.trim().toLowerCase() === 'admin');
  protected readonly isTeacher = computed(() => this.store.auth()?.role.trim().toLowerCase() === 'teacher');

  openAuthDialog(): void {
    this.store.clearErrors();
    this.dialog.open(AuthDialog, {
      width: 'min(500px, 92vw)',
      autoFocus: false,
    });
  }

  logout(): void {
    this.store.logout();
  }
}
