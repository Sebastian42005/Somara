import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
} from '../models/auth.dto';
import {
  ScheduleEntryRequestDto,
  ScheduleEntryRequestInput,
  ScheduleEntryResponseDto,
} from '../models/schedule-entry.dto';
import {
  TeacherRequestDto,
  TeacherResponseDto,
} from '../models/teacher.dto';
import { TimetableEntry } from '../../timetable/models/timetable-entry.model';

interface RequestState {
  loading: boolean;
  error: string | null;
}

const AUTH_STORAGE_KEY = 'somara.auth';

@Injectable({ providedIn: 'root' })
export class SomaraSignalStore {
  private readonly http = inject(HttpClient);
  private readonly apiBasePath = 'http://localhost:8080/api';

  private readonly authResponseSignal = signal<AuthResponseDto | null>(null);
  private readonly teachersSignal = signal<TeacherResponseDto[]>([]);
  private readonly scheduleEntriesSignal = signal<ScheduleEntryResponseDto[]>([]);

  private readonly authRequestStateSignal = signal<RequestState>({ loading: false, error: null });
  private readonly teachersRequestStateSignal = signal<RequestState>({ loading: false, error: null });
  private readonly scheduleRequestStateSignal = signal<RequestState>({ loading: false, error: null });

  readonly auth = computed(() => this.authResponseSignal());
  readonly token = computed(() => this.authResponseSignal()?.token ?? null);
  readonly isAuthenticated = computed(() => this.token() !== null);

  readonly teachers = computed(() => this.teachersSignal());
  readonly scheduleEntries = computed(() => this.scheduleEntriesSignal());
  readonly timetableEntries = computed<TimetableEntry[]>(() =>
    this.scheduleEntriesSignal().map((entry) => ({
      name: entry.name,
      start: new Date(entry.start),
      end: new Date(entry.end),
      color: entry.color,
      level: entry.level,
      teacher: {
        id: entry.teacher.id,
        name: entry.teacher.name,
      },
    })),
  );

  readonly isAuthLoading = computed(() => this.authRequestStateSignal().loading);
  readonly authError = computed(() => this.authRequestStateSignal().error);

  readonly isTeachersLoading = computed(() => this.teachersRequestStateSignal().loading);
  readonly teachersError = computed(() => this.teachersRequestStateSignal().error);

  readonly isScheduleLoading = computed(() => this.scheduleRequestStateSignal().loading);
  readonly scheduleError = computed(() => this.scheduleRequestStateSignal().error);

  constructor() {
    this.restoreAuthFromStorage();
  }

  async register(request: RegisterRequestDto): Promise<AuthResponseDto> {
    this.authRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponseDto>(`${this.apiBasePath}/auth/register`, request),
      );
      this.setAuthResponse(response);
      this.authRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.authRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async login(request: LoginRequestDto): Promise<AuthResponseDto> {
    this.authRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponseDto>(`${this.apiBasePath}/auth/login`, request),
      );
      this.setAuthResponse(response);
      this.authRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.authRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  logout(): void {
    this.setAuthResponse(null);
    this.teachersSignal.set([]);
    this.scheduleEntriesSignal.set([]);
    this.authRequestStateSignal.set({ loading: false, error: null });
  }

  async loadTeachers(): Promise<TeacherResponseDto[]> {
    this.teachersRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<TeacherResponseDto[]>(
          `${this.apiBasePath}/teachers`,
          this.authOptions(),
        ),
      );
      this.teachersSignal.set(response);
      this.teachersRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.teachersRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async getTeacherById(id: number): Promise<TeacherResponseDto> {
    this.teachersRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<TeacherResponseDto>(
          `${this.apiBasePath}/teachers/${id}`,
          this.authOptions(),
        ),
      );
      this.upsertTeacher(response);
      this.teachersRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.teachersRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async createTeacher(request: TeacherRequestDto): Promise<TeacherResponseDto> {
    this.teachersRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.post<TeacherResponseDto>(
          `${this.apiBasePath}/teachers`,
          request,
          this.authOptions(),
        ),
      );
      this.teachersSignal.update((teachers) => [...teachers, response]);
      this.teachersRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.teachersRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async updateTeacher(id: number, request: TeacherRequestDto): Promise<TeacherResponseDto> {
    this.teachersRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.put<TeacherResponseDto>(
          `${this.apiBasePath}/teachers/${id}`,
          request,
          this.authOptions(),
        ),
      );
      this.upsertTeacher(response);
      this.teachersRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.teachersRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async deleteTeacher(id: number): Promise<void> {
    this.teachersRequestStateSignal.set({ loading: true, error: null });

    try {
      await firstValueFrom(
        this.http.delete<void>(
          `${this.apiBasePath}/teachers/${id}`,
          this.authOptions(),
        ),
      );
      this.teachersSignal.update((teachers) => teachers.filter((teacher) => teacher.id !== id));
      this.teachersRequestStateSignal.set({ loading: false, error: null });
    } catch (error) {
      this.teachersRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async loadScheduleEntries(): Promise<ScheduleEntryResponseDto[]> {
    this.scheduleRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<ScheduleEntryResponseDto[]>(
          `${this.apiBasePath}/schedule-entries`,
          this.authOptions(),
        ),
      );
      this.scheduleEntriesSignal.set(response);
      this.scheduleRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.scheduleRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async getScheduleEntryById(id: number): Promise<ScheduleEntryResponseDto> {
    this.scheduleRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<ScheduleEntryResponseDto>(
          `${this.apiBasePath}/schedule-entries/${id}`,
          this.authOptions(),
        ),
      );
      this.upsertScheduleEntry(response);
      this.scheduleRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.scheduleRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async createScheduleEntry(request: ScheduleEntryRequestInput): Promise<ScheduleEntryResponseDto> {
    this.scheduleRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.post<ScheduleEntryResponseDto>(
          `${this.apiBasePath}/schedule-entries`,
          this.toScheduleEntryRequestDto(request),
          this.authOptions(),
        ),
      );
      this.scheduleEntriesSignal.update((entries) => [...entries, response]);
      this.scheduleRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.scheduleRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async updateScheduleEntry(
    id: number,
    request: ScheduleEntryRequestInput,
  ): Promise<ScheduleEntryResponseDto> {
    this.scheduleRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.put<ScheduleEntryResponseDto>(
          `${this.apiBasePath}/schedule-entries/${id}`,
          this.toScheduleEntryRequestDto(request),
          this.authOptions(),
        ),
      );
      this.upsertScheduleEntry(response);
      this.scheduleRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.scheduleRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async deleteScheduleEntry(id: number): Promise<void> {
    this.scheduleRequestStateSignal.set({ loading: true, error: null });

    try {
      await firstValueFrom(
        this.http.delete<void>(
          `${this.apiBasePath}/schedule-entries/${id}`,
          this.authOptions(),
        ),
      );
      this.scheduleEntriesSignal.update((entries) => entries.filter((entry) => entry.id !== id));
      this.scheduleRequestStateSignal.set({ loading: false, error: null });
    } catch (error) {
      this.scheduleRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  clearErrors(): void {
    this.authRequestStateSignal.update((state) => ({ ...state, error: null }));
    this.teachersRequestStateSignal.update((state) => ({ ...state, error: null }));
    this.scheduleRequestStateSignal.update((state) => ({ ...state, error: null }));
  }

  private authOptions(): { headers?: HttpHeaders } {
    const token = this.token();
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  private setAuthResponse(value: AuthResponseDto | null): void {
    this.authResponseSignal.set(value);
    this.persistAuthToStorage(value);
  }

  private restoreAuthFromStorage(): void {
    if (!this.canUseStorage()) {
      return;
    }

    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(rawValue);
      if (this.isAuthResponseDto(parsed)) {
        this.authResponseSignal.set(parsed);
        return;
      }
    } catch {
      // Ignore malformed persisted state and clear it below.
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private persistAuthToStorage(value: AuthResponseDto | null): void {
    if (!this.canUseStorage()) {
      return;
    }

    if (value === null) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
  }

  private canUseStorage(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  private isAuthResponseDto(value: unknown): value is AuthResponseDto {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<AuthResponseDto>;
    return typeof candidate.token === 'string'
      && candidate.token.trim().length > 0
      && typeof candidate.username === 'string'
      && candidate.username.trim().length > 0
      && typeof candidate.role === 'string'
      && candidate.role.trim().length > 0;
  }

  private upsertTeacher(teacher: TeacherResponseDto): void {
    this.teachersSignal.update((teachers) => {
      const existingIndex = teachers.findIndex((existingTeacher) => existingTeacher.id === teacher.id);

      if (existingIndex === -1) {
        return [...teachers, teacher];
      }

      return teachers.map((existingTeacher) =>
        existingTeacher.id === teacher.id ? teacher : existingTeacher,
      );
    });
  }

  private upsertScheduleEntry(entry: ScheduleEntryResponseDto): void {
    this.scheduleEntriesSignal.update((entries) => {
      const existingIndex = entries.findIndex((existingEntry) => existingEntry.id === entry.id);

      if (existingIndex === -1) {
        return [...entries, entry];
      }

      return entries.map((existingEntry) =>
        existingEntry.id === entry.id ? entry : existingEntry,
      );
    });
  }

  private toScheduleEntryRequestDto(request: ScheduleEntryRequestInput): ScheduleEntryRequestDto {
    return {
      name: request.name,
      start: this.toIsoString(request.start),
      end: this.toIsoString(request.end),
      color: request.color,
      level: request.level,
      teacherId: request.teacherId,
    };
  }

  private toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : value;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error === 'object' && 'message' in error.error) {
        const message = error.error.message;
        if (typeof message === 'string' && message.trim().length > 0) {
          return message;
        }
      }

      if (error.status > 0) {
        return `Request failed with status ${error.status}`;
      }

      return 'Network error while calling backend';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error while calling backend';
  }
}
