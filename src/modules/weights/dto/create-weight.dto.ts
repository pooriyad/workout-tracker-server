import { IsDecimal, IsISO8601 } from 'class-validator';

export class CreateWeightDto {
  /**
   * Weight measurement date in ISO format
   * @example '2021-01-18'
   */
  @IsISO8601({
    strict: true,
  })
  date: string;

  /**
   * Weight in whole number like 80, or with one decimal point like 80.5
   * @example '80.5'
   */
  @IsDecimal({ decimal_digits: '1' })
  weight: string;
}
