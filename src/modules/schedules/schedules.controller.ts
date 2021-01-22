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
  Req,
  Query,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interface/request-with-user.interface';
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

// TODO: use a user decorator instead of accessing user with
// '@Req` decorator
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
    @Req() request: RequestWithUser,
  ) {
    return this.schedulesService.create(createScheduleDto, request.user.id);
  }

  @ApiOperation({
    summary: 'Returns an array of schedules for specified month',
  })
  @ApiQuery({ type: MonthQuery })
  @ApiOkResponse({ type: [SchedulePayload] })
  @Get()
  findAllByMonth(
    @Query('month') month: string,
    @Req() request: RequestWithUser,
  ) {
    return this.schedulesService.findAllByMonth(month, request.user.id);
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
    @Req() request: RequestWithUser,
  ) {
    return this.schedulesService.update(
      +id,
      updateScheduleDto,
      request.user.id,
    );
  }

  @ApiOperation({
    summary: 'Deletes one schedule item',
  })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.schedulesService.remove(+id, request.user.id);
  }
}
