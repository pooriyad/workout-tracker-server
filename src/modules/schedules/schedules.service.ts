import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import {
  isBefore,
  parseISO,
  isToday,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ScheduleStatusEnum } from './enum/schedule-status.enum';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto, userId: string) {
    const { date } = createScheduleDto;

    if (createScheduleDto.status === ScheduleStatusEnum.TODO) {
      this.checkAddingTodoIsAllowed(date);
    }

    const scheduledItemInDb = await this.schedulesRepository.findOne({
      where: {
        user: userId,
        date,
      },
    });

    // there should be only one status per date in db
    if (scheduledItemInDb) {
      throw new BadRequestException('An item for this date already exists');
    }

    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      user: userId,
    });

    return this.schedulesRepository.save(schedule);
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
    userId: string,
  ) {
    const toUpdate = await this.schedulesRepository.update(
      {
        id,
        user: userId,
      },
      {
        status: updateScheduleDto.status,
      },
    );
    if (!toUpdate.affected) throw new NotFoundException();
    return this.schedulesRepository.findOne(id);
  }

  async remove(id: number, userId: string) {
    const deleted = await this.schedulesRepository.delete({
      user: userId,
      id,
    });
    if (!deleted.affected) throw new NotFoundException();
  }

  private checkAddingTodoIsAllowed(itemDate: string) {
    const parsed = parseISO(itemDate);
    const isBeforeToday = isBefore(parsed, new Date()) && !isToday(parsed);
    if (isBeforeToday) {
      throw new BadRequestException(
        'Adding todo schedule before current date is not allowed',
      );
    }
  }

  findAllByMonth(month: string, userId: string) {
    const parsedMonth = parseISO(month);
    const start = startOfMonth(parsedMonth);
    const end = endOfMonth(parsedMonth);
    return this.schedulesRepository.find({
      where: {
        user: userId,
        date: Between(start, end),
      },
    });
  }
}
