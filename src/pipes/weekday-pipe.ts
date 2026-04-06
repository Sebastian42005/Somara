import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weekday',
})
export class WeekdayPipe implements PipeTransform {
  transform(value: string): unknown {
    return value.slice(0, 2);
  }
}
