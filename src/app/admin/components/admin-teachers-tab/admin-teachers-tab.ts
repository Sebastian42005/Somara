import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfilePicture } from '../../../components/profile-picture/profile-picture';
import { AdminTeacherSummary } from '../../models/admin-teacher-summary.model';

@Component({
  selector: 'app-admin-teachers-tab',
  imports: [
    DatePipe,
    MatIconModule,
    ProfilePicture,
  ],
  templateUrl: './admin-teachers-tab.html',
  styleUrl: './admin-teachers-tab.scss',
})
export class AdminTeachersTab {
  readonly teacherSummaries = input.required<AdminTeacherSummary[]>();
  readonly isTeachersLoading = input.required<boolean>();
  readonly isBusy = input.required<boolean>();

  readonly editTeacher = output<number>();

  onEditTeacherClick(teacherId: number): void {
    this.editTeacher.emit(teacherId);
  }
}
