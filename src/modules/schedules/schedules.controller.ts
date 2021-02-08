import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulePayload } from './dto/schedule-payload.dto';
import { MonthQuery } from './dto/month-query.dto';
import { UserId } from 'src/decorators/user-id.decorator';
import { CreatesRecurringScheduleDto } from './dto/create-recurring-schedule.dto';

@ApiTags('schedules')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @ApiOperation({
    summary: 'Creates a new schedule item',
  })
  @ApiCreatedResponse({
    type: SchedulePayload,
  })
  @Post()
  create(
    @Body() createScheduleDto: CreateScheduleDto,
    @UserId() userId: string,
  ) {
    return this.schedulesService.create(createScheduleDto, userId);
  }

  @ApiOperation({
    summary: 'Creates recurring weekly to-do schedule until the specified date',
  })
  @Post('recurring')
  createRecurringSchedule(
    @Body() createRecurringScheduleDto: CreatesRecurringScheduleDto,
    @UserId() userId: string,
  ) {
    return this.schedulesService.createRecurringSchedule(
      createRecurringScheduleDto,
      userId,
    );
  }

  @ApiOperation({
    summary: 'Returns an array of schedules for specified month',
  })
  @ApiQuery({ type: MonthQuery })
  @ApiOkResponse({ type: [SchedulePayload] })
  @Get()
  findAllByMonth(@Query() query: MonthQuery, @UserId() userId: string) {
    return this.schedulesService.findAllByMonth(query.month, userId);
  }

  @ApiOperation({
    summary: 'Updates one schedule item',
  })
  @ApiOkResponse({
    type: SchedulePayload,
  })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @UserId() userId: string,
  ) {
    return this.schedulesService.update(+id, updateScheduleDto, userId);
  }

  @ApiOperation({
    summary: 'Deletes one schedule item',
  })
  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.schedulesService.remove(+id, userId);
  }
}
