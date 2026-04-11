import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface AdminStatCard {
  key: string;
  label: string;
  value: number;
  icon: string;
}

@Component({
  selector: 'app-admin-overview-stats',
  imports: [MatIconModule],
  templateUrl: './admin-overview-stats.html',
  styleUrl: './admin-overview-stats.scss',
})
export class AdminOverviewStats {
  readonly teacherCount = input.required<number>();
  readonly classCount = input.required<number>();
  readonly entryCount = input.required<number>();
  readonly upcomingEntryCount = input.required<number>();
  readonly userCount = input.required<number>();
  readonly adminUserCount = input.required<number>();

  readonly cards = computed<AdminStatCard[]>(() => [
    { key: 'teachers', label: 'Lehrer', value: this.teacherCount(), icon: 'groups' },
    { key: 'classes', label: 'Klassen', value: this.classCount(), icon: 'school' },
    { key: 'entries', label: 'Einträge gesamt', value: this.entryCount(), icon: 'event_note' },
    { key: 'upcoming', label: 'Nächste Einträge', value: this.upcomingEntryCount(), icon: 'schedule' },
    { key: 'users', label: 'User gesamt', value: this.userCount(), icon: 'person_outline' },
    { key: 'admins', label: 'Admins', value: this.adminUserCount(), icon: 'verified_user' },
  ]);
}
