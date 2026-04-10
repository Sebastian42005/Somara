import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CreateTimetableEntryDialog } from './create-timetable-entry-dialog';
import { SomaraSignalStore } from '../../core/store/somara-signal.store';

describe('CreateTimetableEntryDialog', () => {
  let component: CreateTimetableEntryDialog;
  let fixture: ComponentFixture<CreateTimetableEntryDialog>;
  const dialogRefMock = { close: () => undefined };
  const storeMock = {
    teachers: signal([{ id: 1, name: 'Lehrer' }]),
    timetableEntryColors: signal([{ name: 'Mathe', colorHex: '#005F6A' }]),
    isTeachersLoading: signal(false),
    isTimetableLoading: signal(false),
    isTimetableColorsLoading: signal(false),
    timetableError: signal<string | null>(null),
    teachersError: signal<string | null>(null),
    timetableColorsError: signal<string | null>(null),
    loadTeachers: async () => [{ id: 1, name: 'Lehrer' }],
    loadTimetableEntryColors: async () => [{ name: 'Mathe', colorHex: '#005F6A' }],
    createTimetableEntry: async () => undefined,
    clearErrors: () => undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTimetableEntryDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: SomaraSignalStore, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTimetableEntryDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
