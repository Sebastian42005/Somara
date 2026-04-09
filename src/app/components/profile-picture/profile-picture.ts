import { Component, computed, inject } from '@angular/core';
import { SomaraSignalStore } from '../../core/store/somara-signal.store';

@Component({
  selector: 'app-profile-picture',
  imports: [],
  templateUrl: './profile-picture.html',
  styleUrl: './profile-picture.scss',
})
export class ProfilePicture {
  private readonly store = inject(SomaraSignalStore);
  protected readonly username = computed(() => this.store.auth()?.username ?? '');
  protected readonly initials = computed(() => this.username().slice(0, 1).toUpperCase())
}
