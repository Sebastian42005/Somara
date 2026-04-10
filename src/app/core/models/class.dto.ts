export interface CreateClassRequestDto {
  name: string;
  description: string;
  color: string;
  image?: File;
}

export interface ClassRequestDto {
  name: string;
  description: string;
  color: string;
}

export interface ClassResponseDto {
  id: number;
  name: string;
  description: string;
  color: string;
  hasImage: boolean;
}
