import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimetableEntryComponent } from './timetable-entry';

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
      name: 'Mathe',
      start: new Date('2026-04-09T08:00:00.000Z'),
      end: new Date('2026-04-09T09:00:00.000Z'),
      color: '#005F6A',
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
