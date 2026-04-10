import { TeacherResponseDto } from './teacher.dto';

export type ScheduleEntryLevel = 'beginner' | 'advanced' | 'all levels';

export interface ScheduleEntryRequestDto {
  name: string;
  start: string;
  end: string;
  color: string;
  level: ScheduleEntryLevel;
  teacherId: number;
}

export interface ScheduleEntryRequestInput {
  name: string;
  start: Date | string;
  end: Date | string;
  color: string;
  level: ScheduleEntryLevel;
  teacherId: number;
}

export interface ScheduleEntryResponseDto {
  id: number;
  name: string;
  start: string;
  end: string;
  color: string;
  level: ScheduleEntryLevel;
  teacher: TeacherResponseDto;
}

export interface ScheduleEntrySuggestionDto {
  name: string;
  colorHex: string;
}
