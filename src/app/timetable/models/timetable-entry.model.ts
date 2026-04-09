export interface Teacher {
  id: number;
  name: string;
}

export interface TimetableEntry {
  name: string;
  start: Date;
  end: Date;
  color: string;
  level: string;
  teacher: Teacher;
}

export type WeekdayInput = number | string;
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening';
export type TimeOfDayEntryMap = Record<TimeOfDay, TimetableEntry[]>;

const WEEKDAY_NAME_TO_INDEX: Record<string, number> = {
  sonntag: 0,
  montag: 1,
  dienstag: 2,
  mittwoch: 3,
  donnerstag: 4,
  freitag: 5,
  samstag: 6,
};

function normalizeWeekday(weekday: WeekdayInput): number {
  if (typeof weekday === 'number' && weekday >= 0 && weekday <= 6) {
    return weekday;
  }

  if (typeof weekday === 'string') {
    const normalized = weekday.trim().toLowerCase();
    const dayIndex = WEEKDAY_NAME_TO_INDEX[normalized];

    if (dayIndex !== undefined) {
      return dayIndex;
    }
  }

  throw new Error(`Ungueltiger Wochentag: ${weekday}`);
}

function getTimeOfDayByHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }

  if (hour >= 12 && hour < 15) {
    return 'midday';
  }

  if (hour >= 15 && hour < 18) {
    return 'afternoon';
  }

  return 'evening';
}

export function filterEntriesForWeekday(entries: TimetableEntry[], weekday: WeekdayInput): TimetableEntry[] {
  const targetWeekday = normalizeWeekday(weekday);

  return entries
    .filter((entry) => entry.start.getDay() === targetWeekday)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function groupEntriesByTimeOfDay(entries: TimetableEntry[]): TimeOfDayEntryMap {
  const grouped: TimeOfDayEntryMap = {
    morning: [],
    midday: [],
    afternoon: [],
    evening: [],
  };

  for (const entry of entries) {
    grouped[getTimeOfDayByHour(entry.start.getHours())].push(entry);
  }

  return grouped;
}

export function filterEntriesForTimeOfDay(entries: TimetableEntry[], timeOfDay: TimeOfDay): TimetableEntry[] {
  return groupEntriesByTimeOfDay(entries)[timeOfDay];
}

export function filterEntriesForWeekdayGroupedByTimeOfDay(
  entries: TimetableEntry[],
  weekday: WeekdayInput,
): TimeOfDayEntryMap {
  return groupEntriesByTimeOfDay(filterEntriesForWeekday(entries, weekday));
}

export function getMinutesDifference(startDate: Date, endDate: Date): number {
  const diffInMilliseconds = endDate.getTime() - startDate.getTime();
  return Math.round(diffInMilliseconds / 60000);
}
