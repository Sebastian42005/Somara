import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
} from '../models/auth.dto';
import {
  TimetableEntryRequestDto,
  TimetableEntryRequestInput,
  TimetableEntryResponseDto,
  TimetableEntryColorDto,
} from '../models/timetable-entry.dto';
import {
  CreateTeacherRequestDto,
  TeacherRequestDto,
  TeacherResponseDto,
} from '../models/teacher.dto';
import {
  ClassResponseDto,
  CreateClassRequestDto,
} from '../models/class.dto';
import { TimetableEntry } from '../../timetable/models/timetable-entry.model';

interface RequestState {
  loading: boolean;
  error: string | null;
}

const AUTH_STORAGE_KEY = 'somara.auth';
export const apiBasePath = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class SomaraSignalStore {
  private readonly http = inject(HttpClient);

  private readonly authResponseSignal = signal<AuthResponseDto | null>(null);
  private readonly teachersSignal = signal<TeacherResponseDto[]>([]);
  private readonly classesSignal = signal<ClassResponseDto[]>([]);
  private readonly timetableEntryResponsesSignal = signal<TimetableEntryResponseDto[]>([]);
  private readonly timetableEntryColorsSignal = signal<TimetableEntryColorDto[]>([]);

  private readonly authRequestStateSignal = signal<RequestState>({ loading: false, error: null });
  private readonly teachersRequestStateSignal = signal<RequestState>({ loading: false, error: null });
  private readonly classesRequestStateSignal = signal<RequestState>({ loading: false, error: null });
  private readonly timetableRequestStateSignal = signal<RequestState>({ loading: false, error: null });
  private readonly timetableColorsRequestStateSignal = signal<RequestState>({ loading: false, error: null });

  readonly auth = computed(() => this.authResponseSignal());
  readonly token = computed(() => this.authResponseSignal()?.token ?? null);
  readonly isAuthenticated = computed(() => this.token() !== null);

  readonly teachers = computed(() => this.teachersSignal());
  readonly classes = computed(() => this.classesSignal());
  readonly timetableEntryResponses = computed(() => this.timetableEntryResponsesSignal());
  readonly timetableEntryColors = computed(() => this.timetableEntryColorsSignal());
  readonly timetableEntries = computed<TimetableEntry[]>(() =>
    this.timetableEntryResponsesSignal().map((entry) => {
      const entryColor = entry.yogaClass?.color ?? entry.color ?? '#0F766E';

      return {
        name: entry.name,
        start: new Date(entry.start),
        end: new Date(entry.end),
        color: entryColor,
        yogaClass: {
          id: entry.yogaClass?.id ?? 0,
          name: entry.yogaClass?.name ?? 'Klasse',
          color: entryColor,
        },
        level: entry.level,
        teacher: {
          id: entry.teacher.id,
          name: entry.teacher.name,
          description: entry.teacher.description ?? null,
          profileImage: entry.teacher.profileImage ?? null,
        },
      };
    }),
  );

  readonly isAuthLoading = computed(() => this.authRequestStateSignal().loading);
  readonly authError = computed(() => this.authRequestStateSignal().error);

  readonly isTeachersLoading = computed(() => this.teachersRequestStateSignal().loading);
  readonly teachersError = computed(() => this.teachersRequestStateSignal().error);

  readonly isClassesLoading = computed(() => this.classesRequestStateSignal().loading);
  readonly classesError = computed(() => this.classesRequestStateSignal().error);

  readonly isTimetableLoading = computed(() => this.timetableRequestStateSignal().loading);
  readonly timetableError = computed(() => this.timetableRequestStateSignal().error);
  readonly isTimetableColorsLoading = computed(() => this.timetableColorsRequestStateSignal().loading);
  readonly timetableColorsError = computed(() => this.timetableColorsRequestStateSignal().error);

  constructor() {
    this.restoreAuthFromStorage();
  }

  async register(request: RegisterRequestDto): Promise<AuthResponseDto> {
    this.authRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponseDto>(`${apiBasePath}/auth/register`, request),
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
        this.http.post<AuthResponseDto>(`${apiBasePath}/auth/login`, request),
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
    this.classesSignal.set([]);
    this.timetableEntryResponsesSignal.set([]);
    this.authRequestStateSignal.set({ loading: false, error: null });
  }

  async loadTeachers(): Promise<TeacherResponseDto[]> {
    this.teachersRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<TeacherResponseDto[]>(
          `${apiBasePath}/teachers`,
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
          `${apiBasePath}/teachers/${id}`,
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

  async loadClasses(): Promise<ClassResponseDto[]> {
    this.classesRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<ClassResponseDto[]>(
          `${apiBasePath}/yoga-classes`,
          this.authOptions(),
        ),
      );
      this.classesSignal.set(response);
      this.classesRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.classesRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async createClass(request: CreateClassRequestDto): Promise<ClassResponseDto> {
    this.classesRequestStateSignal.set({ loading: true, error: null });

    try {
      const createdClass = await firstValueFrom(
        this.http.post<ClassResponseDto>(
          `${apiBasePath}/yoga-classes`,
          {
            name: request.name,
            description: request.description,
            color: request.color,
          },
          this.authOptions(),
        ),
      );

      if (request.image) {
        const imagePayload = new FormData();
        imagePayload.append('file', request.image);

        await firstValueFrom(
          this.http.put<void>(
            `${apiBasePath}/yoga-classes/${createdClass.id}/image`,
            imagePayload,
            this.authOptions(),
          ),
        );
      }

      const classToInsert: ClassResponseDto = request.image
        ? { ...createdClass, hasImage: true }
        : createdClass;

      this.classesSignal.update((classes) => [...classes, classToInsert]);
      this.classesRequestStateSignal.set({ loading: false, error: null });
      return classToInsert;
    } catch (error) {
      this.classesRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async createTeacher(request: CreateTeacherRequestDto): Promise<TeacherResponseDto> {
    this.teachersRequestStateSignal.set({ loading: true, error: null });

    try {
      const payload = new FormData();
      payload.append('name', request.name);
      payload.append('description', request.description);
      payload.append('profileImage', request.profileImage);

      const response = await firstValueFrom(
        this.http.post<TeacherResponseDto>(
          `${apiBasePath}/teachers`,
          payload,
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
          `${apiBasePath}/teachers/${id}`,
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
          `${apiBasePath}/teachers/${id}`,
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

  async loadTimetableEntries(): Promise<TimetableEntryResponseDto[]> {
    this.timetableRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<TimetableEntryResponseDto[]>(
          `${apiBasePath}/timetable-entries`,
          this.authOptions(),
        ),
      );
      this.timetableEntryResponsesSignal.set(response);
      this.timetableRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.timetableRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async loadTimetableEntryColors(): Promise<TimetableEntryColorDto[]> {
    this.timetableColorsRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<TimetableEntryColorDto[]>(
          `${apiBasePath}/timetable-entries/colors`,
          this.authOptions(),
        ),
      );
      this.timetableEntryColorsSignal.set(response);
      this.timetableColorsRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.timetableColorsRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async getTimetableEntryById(id: number): Promise<TimetableEntryResponseDto> {
    this.timetableRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.get<TimetableEntryResponseDto>(
          `${apiBasePath}/timetable-entries/${id}`,
          this.authOptions(),
        ),
      );
      this.upsertTimetableEntry(response);
      this.timetableRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.timetableRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async createTimetableEntry(request: TimetableEntryRequestInput): Promise<TimetableEntryResponseDto> {
    this.timetableRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.post<TimetableEntryResponseDto>(
          `${apiBasePath}/timetable-entries`,
          this.toTimetableEntryRequestDto(request),
          this.authOptions(),
        ),
      );
      this.timetableEntryResponsesSignal.update((entries) => [...entries, response]);
      this.timetableRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.timetableRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async updateTimetableEntry(
    id: number,
    request: TimetableEntryRequestInput,
  ): Promise<TimetableEntryResponseDto> {
    this.timetableRequestStateSignal.set({ loading: true, error: null });

    try {
      const response = await firstValueFrom(
        this.http.put<TimetableEntryResponseDto>(
          `${apiBasePath}/timetable-entries/${id}`,
          this.toTimetableEntryRequestDto(request),
          this.authOptions(),
        ),
      );
      this.upsertTimetableEntry(response);
      this.timetableRequestStateSignal.set({ loading: false, error: null });
      return response;
    } catch (error) {
      this.timetableRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  async deleteTimetableEntry(id: number): Promise<void> {
    this.timetableRequestStateSignal.set({ loading: true, error: null });

    try {
      await firstValueFrom(
        this.http.delete<void>(
          `${apiBasePath}/timetable-entries/${id}`,
          this.authOptions(),
        ),
      );
      this.timetableEntryResponsesSignal.update((entries) => entries.filter((entry) => entry.id !== id));
      this.timetableRequestStateSignal.set({ loading: false, error: null });
    } catch (error) {
      this.timetableRequestStateSignal.set({
        loading: false,
        error: this.toErrorMessage(error),
      });
      throw error;
    }
  }

  clearErrors(): void {
    this.authRequestStateSignal.update((state) => ({ ...state, error: null }));
    this.teachersRequestStateSignal.update((state) => ({ ...state, error: null }));
    this.classesRequestStateSignal.update((state) => ({ ...state, error: null }));
    this.timetableRequestStateSignal.update((state) => ({ ...state, error: null }));
    this.timetableColorsRequestStateSignal.update((state) => ({ ...state, error: null }));
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

  private upsertTimetableEntry(entry: TimetableEntryResponseDto): void {
    this.timetableEntryResponsesSignal.update((entries) => {
      const existingIndex = entries.findIndex((existingEntry) => existingEntry.id === entry.id);

      if (existingIndex === -1) {
        return [...entries, entry];
      }

      return entries.map((existingEntry) =>
        existingEntry.id === entry.id ? entry : existingEntry,
      );
    });
  }

  private toTimetableEntryRequestDto(request: TimetableEntryRequestInput): TimetableEntryRequestDto {
    return {
      name: request.name,
      start: this.toIsoString(request.start),
      end: this.toIsoString(request.end),
      yogaClassId: request.yogaClassId,
      classId: request.yogaClassId,
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
