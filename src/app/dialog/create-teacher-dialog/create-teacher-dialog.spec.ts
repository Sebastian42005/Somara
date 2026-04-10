import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { SomaraSignalStore } from '../../core/store/somara-signal.store';
import { CreateTeacherDialog } from './create-teacher-dialog';

describe('CreateTeacherDialog', () => {
  let component: CreateTeacherDialog;
  let fixture: ComponentFixture<CreateTeacherDialog>;

  const dialogRefMock = { close: () => undefined };
  const storeMock = {
    isTeachersLoading: signal(false),
    teachersError: signal<string | null>(null),
    createTeacher: async () => ({ id: 1, name: 'Lehrer', description: 'Beschreibung', profileImage: '/img/test.png' }),
    clearErrors: () => undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTeacherDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: SomaraSignalStore, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTeacherDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
