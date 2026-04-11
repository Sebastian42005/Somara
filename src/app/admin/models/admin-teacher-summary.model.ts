import { TimetableEntry } from '../../timetable/models/timetable-entry.model';

export interface AdminTeacherSummary {
  teacher: {
    id: number;
    name: string;
    description?: string | null;
    profileImage?: string | null;
  };
  entryCount: number;
  nextEntry: TimetableEntry | null;
}
