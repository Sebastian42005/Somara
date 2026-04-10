import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { apiBasePath, SomaraSignalStore } from '../core/store/somara-signal.store';

@Component({
  selector: 'app-classes',
  imports: [MatIconModule],
  templateUrl: './classes.html',
  styleUrl: './classes.scss',
})
export class Classes {
  private readonly store = inject(SomaraSignalStore);

  readonly classes = this.store.classes;
  readonly isClassesLoading = this.store.isClassesLoading;
  readonly classesError = this.store.classesError;
  readonly classCount = computed(() => this.classes().length);
  readonly loadingSlots = [1, 2, 3, 4, 5, 6];

  constructor() {
    void this.reloadClasses();
  }

  async reloadClasses(): Promise<void> {
    this.store.clearErrors();
    try {
      await this.store.loadClasses();
    } catch {
      // Fehler wird bereits im Store gesetzt und im Template angezeigt.
    }
  }

  getClassImageUrl(classId: number): string {
    return `${apiBasePath}/yoga-classes/${classId}/image`;
  }

  getClassInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || 'K';
  }

  formatColor(colorValue: string): string {
    return colorValue.toUpperCase();
  }
}
