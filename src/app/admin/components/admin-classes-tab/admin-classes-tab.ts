import { NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClassResponseDto } from '../../../core/models/class.dto';
import { apiBasePath } from '../../../core/store/somara-signal.store';

@Component({
  selector: 'app-admin-classes-tab',
  imports: [
    NgStyle,
    MatIconModule,
  ],
  templateUrl: './admin-classes-tab.html',
  styleUrl: './admin-classes-tab.scss',
})
export class AdminClassesTab {
  readonly classes = input.required<ClassResponseDto[]>();
  readonly isClassesLoading = input.required<boolean>();
  readonly isBusy = input.required<boolean>();

  readonly editClass = output<number>();

  getClassImageUrl(classId: number): string {
    return `${apiBasePath}/yoga-classes/${classId}/image`;
  }

  onEditClassClick(classId: number): void {
    this.editClass.emit(classId);
  }
}
