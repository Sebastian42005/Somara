import { Component, effect, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AdminUserResponseDto } from '../../../core/models/auth.dto';
import { apiBasePath } from '../../../core/store/somara-signal.store';

@Component({
  selector: 'app-admin-users-tab',
  imports: [MatIconModule],
  templateUrl: './admin-users-tab.html',
  styleUrl: './admin-users-tab.scss',
})
export class AdminUsersTab {
  readonly users = input.required<AdminUserResponseDto[]>();
  readonly isAdminUsersLoading = input.required<boolean>();
  readonly isBusy = input.required<boolean>();
  readonly currentUsername = input.required<string>();

  readonly editUser = output<number>();

  private readonly imageLoadErrorIds = signal<Set<number>>(new Set<number>());

  constructor() {
    effect(() => {
      this.users();
      this.imageLoadErrorIds.set(new Set<number>());
    });
  }

  isCurrentUser(user: AdminUserResponseDto): boolean {
    return user.username.trim().toLowerCase() === this.currentUsername().trim().toLowerCase();
  }

  shouldShowProfileImage(user: AdminUserResponseDto): boolean {
    return user.hasProfileImage && !this.imageLoadErrorIds().has(user.id);
  }

  onProfileImageError(userId: number): void {
    this.imageLoadErrorIds.update((existingIds) => {
      if (existingIds.has(userId)) {
        return existingIds;
      }

      const updatedIds = new Set(existingIds);
      updatedIds.add(userId);
      return updatedIds;
    });
  }

  getProfileImageUrl(userId: number): string {
    return `${apiBasePath}/admin/users/${userId}/profile-image`;
  }

  getUserInitial(username: string): string {
    return username.slice(0, 1).toUpperCase();
  }

  onEditUserClick(userId: number): void {
    this.editUser.emit(userId);
  }
}
