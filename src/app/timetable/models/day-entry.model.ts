export interface DayEntry {
  date: string;
  weekday: string;
  value: Date;
  isoDate: string;
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDayEntryFromDate(date: Date, locale: string = 'de-DE'): DayEntry {
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return {
    date: normalizedDate.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
    }),
    weekday: normalizedDate.toLocaleDateString(locale, {
      weekday: 'long',
    }),
    value: normalizedDate,
    isoDate: toLocalDateKey(normalizedDate),
  };
}

function getMondayForDate(date: Date): Date {
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // 0 (So) - 6 (Sa)
  const day = normalizedDate.getDay();

  // Montag berechnen (ISO-Logik)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  normalizedDate.setDate(normalizedDate.getDate() + diffToMonday);

  return normalizedDate;
}

export function getWeekForDate(referenceDate: Date, locale: string = 'de-DE'): DayEntry[] {
  const result: DayEntry[] = [];
  const monday = getMondayForDate(referenceDate);

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    result.push(createDayEntryFromDate(current, locale));
  }

  return result;
}

export function getCurrentWeek(locale: string = 'de-DE'): DayEntry[] {
  return getWeekForDate(new Date(), locale);
}
