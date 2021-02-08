import { ArrayUnique, IsISO8601, IsNumber, Max } from 'class-validator';

import { MinISODate } from 'src/decorators/min-iso-date.decorator';

export class CreatesRecurringScheduleDto {
  /**
   * Scheduled date in ISO format
   * @example '2021-01-18'
   */
  @MinISODate()
  @IsISO8601({
    strict: true,
  })
  date: string;

  /**
   * an array of weekdays indexes:
   * starting from Sunday (0) to Saturday (6)
   * @example '[0, 1, 6]'
   */
  @Max(6, {
    each: true,
  })
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  @ArrayUnique()
  weekdays: number[];
}
