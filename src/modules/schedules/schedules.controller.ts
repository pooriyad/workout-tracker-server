import {
  Controller,
  Get,
  Post,
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
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interface/request-with-user.interface';
import { ApiTags } from '@nestjs/swagger';

// TODO: use a user decorator instead of accessing user with
// '@Req` decorator
@ApiTags('schedules')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  createOrUpdate(
    @Body() createScheduleDto: CreateScheduleDto,
    @Req() request: RequestWithUser,
  ) {
    return this.schedulesService.createOrUpdate(
      createScheduleDto,
      request.user.id,
    );
  }

  @Get()
  // :TODO: improve swagger documentation
  findAllByMonth(
    @Query('month') month: string,
    @Req() request: RequestWithUser,
  ) {
    return this.schedulesService.findAllByMonth(month, request.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.schedulesService.remove(+id, request.user.id);
  }
}
