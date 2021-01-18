import { IsEnum, IsISO8601 } from 'class-validator';
import { ScheduleStatusEnum } from '../enum/schedule-status.enum';

export class CreateScheduleDto {
  /**
   * Scheduled date in ISO format
   * @example '2021-01-18'
   */
  @IsISO8601({
    strict: true,
  })
  date: string;

  /**
   * Status of the schedule
   * @example 'done'
   */
  @IsEnum(ScheduleStatusEnum)
  status: ScheduleStatusEnum;
}
