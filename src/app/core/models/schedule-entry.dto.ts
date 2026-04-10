import { TeacherResponseDto } from './teacher.dto';

export type ScheduleEntryLevel = 'beginner' | 'advanced' | 'all levels';

export interface ScheduleEntryYogaClassDto {
  id: number;
  name: string;
  color: string;
}

export interface ScheduleEntryRequestDto {
  name: string;
  start: string;
  end: string;
  yogaClassId: number;
  classId?: number;
  level: ScheduleEntryLevel;
  teacherId: number;
}

export interface ScheduleEntryRequestInput {
  name: string;
  start: Date | string;
  end: Date | string;
  yogaClassId: number;
  level: ScheduleEntryLevel;
  teacherId: number;
}

export interface ScheduleEntryResponseDto {
  id: number;
  name: string;
  start: string;
  end: string;
  color?: string;
  yogaClass?: ScheduleEntryYogaClassDto | null;
  level: ScheduleEntryLevel;
  teacher: TeacherResponseDto;
}

export interface ScheduleEntrySuggestionDto {
  name: string;
  colorHex: string;
}
