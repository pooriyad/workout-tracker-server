import { IsISO8601, IsOptional } from 'class-validator';

export class FindQuery {
  /**
   * a date in ISO format.
   * @example '2021-01-01'
   */
  @IsISO8601({
    strict: true,
  })
  @IsOptional()
  date?: string;

  /**
   * month in ISO format.
   * @example '2021-01'
   */
  @IsISO8601({
    strict: true,
  })
  @IsOptional()
  month?: string;
}
