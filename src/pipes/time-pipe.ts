import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined, locale: string = 'de-DE'): string {
    if (value === null || value === undefined) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
