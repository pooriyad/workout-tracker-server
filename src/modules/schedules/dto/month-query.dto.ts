import { IsISO8601 } from 'class-validator';

export class MonthQuery {
  /**
   * a combination of month and year in ISO format
   * @example '2021-02'
   */
  @IsISO8601({
    strict: true,
  })
  month: string;
}
