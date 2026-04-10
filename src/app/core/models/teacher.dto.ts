export interface TeacherRequestDto {
  name: string;
  description: string;
  profileImage?: string;
}

export interface CreateTeacherRequestDto {
  name: string;
  description: string;
  profileImage: File;
}

export interface TeacherResponseDto {
  id: number;
  name: string;
  description?: string | null;
  profileImage?: string | null;
}
