import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, MoreThan } from 'typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import {
  isBefore,
  getDay,
  parseISO,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isAfter,
} from 'date-fns';
import { ScheduleStatusEnum } from './enum/schedule-status.enum';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreatesRecurringScheduleDto } from './dto/create-recurring-schedule.dto';

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

    if (createScheduleDto.status === ScheduleStatusEnum.DONE) {
      this.checkAddingDoneIsAllowed(date);
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

  async createRecurringSchedule(
    createRecurringScheduleDto: CreatesRecurringScheduleDto,
    userId: string,
  ) {
    const { date } = createRecurringScheduleDto;
    const selectedWeekdays = createRecurringScheduleDto.weekdays;

    await this.deleteFutureTodos(userId);

    const allDatesUntilSpecifiedDate = this.getDatesUntil(date);

    // create an array of dates based on selected weekdays
    const scheduleDates = this.createScheduleDates(
      allDatesUntilSpecifiedDate,
      selectedWeekdays,
    );

    // for each date in the array of scheduleDates create a schedule item
    const scheduleItems = this.createScheduleItems(scheduleDates, userId);

    await this.schedulesRepository.save(scheduleItems);
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

  findAllByMonth(month: string, userId: string) {
    const parsedMonth = this.parsedISO(month);
    const start = startOfMonth(parsedMonth);
    const end = endOfMonth(parsedMonth);
    return this.schedulesRepository.find({
      where: {
        user: userId,
        date: Between(start, end),
      },
    });
  }

  async getStatistics(userId: string) {
    const statistics = {
      done: 0,
      missed: 0,
      indeterminate: 0,
      todo: 0,
    };

    const schedules = await this.schedulesRepository.find({ user: userId });

    schedules.forEach((schedule) => statistics[schedule.status]++);

    return statistics;
  }

  private parsedISO(ISODate: string) {
    return parseISO(ISODate);
  }

  private checkAddingTodoIsAllowed(itemDate: string) {
    const parsedISO = this.parsedISO(itemDate);
    const isBeforeToday =
      isBefore(parsedISO, new Date()) && !isToday(parsedISO);
    if (isBeforeToday) {
      throw new BadRequestException(
        'Adding todo schedule before current date is not allowed',
      );
    }
  }

  private checkAddingDoneIsAllowed(itemDate: string) {
    const parsedISO = this.parsedISO(itemDate);

    if (isAfter(parsedISO, new Date())) {
      throw new BadRequestException(
        'Adding done schedule after current date is not allowed',
      );
    }
  }

  private async deleteFutureTodos(userId: string) {
    const now = new Date();

    await this.schedulesRepository.delete({
      user: userId,
      status: ScheduleStatusEnum.TODO,
      date: MoreThan(now),
    });
  }

  private getDatesUntil(end: string) {
    return eachDayOfInterval({
      start: new Date(),
      end: this.parsedISO(end),
    });
  }

  private createScheduleDates(dates: Date[], selectedWeekdays: number[]) {
    return dates.filter((date) => {
      const currentDay = getDay(date);
      if (selectedWeekdays.includes(currentDay)) {
        return date;
      }
    });
  }

  private createScheduleItems(scheduleDates: Date[], userId: string) {
    return scheduleDates.map((date: Date) => {
      return {
        date,
        status: ScheduleStatusEnum.TODO,
        user: userId,
      };
    });
  }
}
