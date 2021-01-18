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

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
  ) {}

  async createOrUpdate(createScheduleDto: CreateScheduleDto, userId: string) {
    // prevent submitting todo schedule before current day
    if (createScheduleDto.status === ScheduleStatusEnum.TODO) {
      this.checkAddingTodoIsAllowed(createScheduleDto.date);
    }

    const scheduledItemInDb = await this.findByDate(
      createScheduleDto.date,
      userId,
    );
    // if item exists in the database update it, otherwise save it
    if (scheduledItemInDb) {
      return this.update(createScheduleDto, scheduledItemInDb.status, userId);
    } else {
      return this.create(createScheduleDto, userId);
    }
  }

  private create(createScheduleDto: CreateScheduleDto, userId: string) {
    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      user: userId,
    });

    return this.schedulesRepository.save(schedule);
  }

  private async update(
    createScheduleDto: CreateScheduleDto,
    scheduledItemInDbStatus: string,
    userId: string,
  ) {
    const { date } = createScheduleDto;

    // TODO: improve this function. it's probably better
    // to use a class property.
    this.checkItemWithSameStatusAlreadyExists(
      createScheduleDto.status,
      scheduledItemInDbStatus,
    );

    await this.schedulesRepository.update(
      {
        user: userId,
        date,
      },
      createScheduleDto,
    );
    return this.findByDate(date, userId);
  }

  async remove(id: number, userId: string) {
    const deleted = await this.schedulesRepository.delete({
      user: userId,
      id,
    });
    if (!deleted.affected) throw new NotFoundException();
  }

  private checkItemWithSameStatusAlreadyExists(
    updateStatus: string,
    scheduledItemInDbStatus: string,
  ) {
    if (updateStatus === scheduledItemInDbStatus) {
      throw new BadRequestException(
        'a schedule with specified status already exists for this date',
      );
    }
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

  private findByDate(date: string, userId: string) {
    return this.schedulesRepository.findOne({
      where: {
        user: userId,
        date,
      },
    });
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
