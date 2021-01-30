import { IsISO8601 } from 'class-validator';

export class DateQuery {
  /**
   * a date in ISO format.
   * @example '2021-01-01'
   */
  @IsISO8601({
    strict: true,
  })
  date: string;
}
