import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { apiBasePath, SomaraSignalStore } from '../../core/store/somara-signal.store';
import { Teacher } from '../../timetable/models/timetable-entry.model';

@Component({
  selector: 'app-profile-picture',
  imports: [],
  templateUrl: './profile-picture.html',
  styleUrl: './profile-picture.scss',
})
export class ProfilePicture {
  private readonly store = inject(SomaraSignalStore);
  readonly teacher = input<Teacher | null | undefined>(undefined);
  protected readonly imageLoadError = signal(false);
  protected readonly username = computed(() => this.store.auth()?.username ?? '');
  protected readonly profileImageUrl = computed(() => {
    const teacher = this.teacher();
    if (!teacher || this.imageLoadError()) {
      return null;
    }

    return this.getTeacherProfilePicture(String(teacher.id));
  });

  protected readonly initials = computed(() => {
    const username = this.teacher()?.name ?? this.username();
    return username.slice(0, 1).toUpperCase();
  });

  constructor() {
    effect(() => {
      this.teacher();
      this.imageLoadError.set(false);
    });
  }

  protected onProfileImageError(): void {
    this.imageLoadError.set(true);
  }

  private getTeacherProfilePicture(id: string): string {
    return `${apiBasePath}/teachers/${id}/profile-image`;
  }
}
