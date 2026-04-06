import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimetableEntry } from './timetable-entry';

describe('TimetableEntry', () => {
  let component: TimetableEntry;
  let fixture: ComponentFixture<TimetableEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimetableEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(TimetableEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
