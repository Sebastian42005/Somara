export interface DayEntry {
  date: string;
  weekday: string;
}

export function getCurrentWeek(locale: string = 'de-DE'): DayEntry[] {
  const result: DayEntry[] = [];
  const today = new Date();

  // 0 (So) - 6 (Sa)
  const day = today.getDay();

  // Montag berechnen (ISO-Logik)
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    result.push({
      date: current.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
      }),
      weekday: current.toLocaleDateString(locale, {
        weekday: 'long',
      }),
    });
  }

  return result;
}
