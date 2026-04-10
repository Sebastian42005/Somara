import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimetableEntryComponent } from './timetable-entry';
import { SOMARA_DEFAULT_CLASS_COLOR_FALLBACK } from '../../core/theme/theme-color';

describe('TimetableEntryComponent', () => {
  let component: TimetableEntryComponent;
  let fixture: ComponentFixture<TimetableEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimetableEntryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimetableEntryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entry', {
      id: 10,
      name: 'Mathe',
      start: new Date('2026-04-09T08:00:00.000Z'),
      end: new Date('2026-04-09T09:00:00.000Z'),
      color: SOMARA_DEFAULT_CLASS_COLOR_FALLBACK,
      yogaClass: {
        id: 2,
        name: 'Yoga Basics',
        color: SOMARA_DEFAULT_CLASS_COLOR_FALLBACK,
      },
      level: 'beginner',
      teacher: {
        id: 1,
        name: 'Lehrer',
      },
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
