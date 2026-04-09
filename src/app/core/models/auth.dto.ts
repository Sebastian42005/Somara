export type UserRole = string;

export interface RegisterRequestDto {
  username: string;
  password: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  username: string;
  role: UserRole;
}
