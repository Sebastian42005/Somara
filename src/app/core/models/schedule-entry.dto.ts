import { TeacherResponseDto } from './teacher.dto';

export interface ScheduleEntryRequestDto {
  name: string;
  start: string;
  end: string;
  color: string;
  level: string;
  teacherId: number;
}

export interface ScheduleEntryRequestInput {
  name: string;
  start: Date | string;
  end: Date | string;
  color: string;
  level: string;
  teacherId: number;
}

export interface ScheduleEntryResponseDto {
  id: number;
  name: string;
  start: string;
  end: string;
  color: string;
  level: string;
  teacher: TeacherResponseDto;
}
