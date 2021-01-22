import { PickType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';

export class UpdateScheduleDto extends PickType(CreateScheduleDto, [
  'status',
]) {}
