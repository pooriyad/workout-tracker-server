import { IsEnum, IsISO8601, NotEquals } from 'class-validator';
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
  // API does not accept indeterminate. because only system
  // should be able to set the status of a schedule to `indeterminate`
  @NotEquals('indeterminate', {
    message: 'Invalid status value',
  })
  status: ScheduleStatusEnum;
}
