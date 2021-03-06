import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  endOfMonth,
  formatISO,
  isAfter,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { Between, Repository } from 'typeorm';
import { CreateWeightGoalDto } from './dto/create-weight-goal.dto';
import { CreateWeightDto } from './dto/create-weight.dto';
import { FindQuery } from './dto/find-query.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import { WeightGoal } from './entities/weight-goal.entity';
import { Weight } from './entities/weight.entity';

@Injectable()
export class WeightsService {
  constructor(
    @InjectRepository(Weight)
    private readonly weightsRepository: Repository<Weight>,
    @InjectRepository(WeightGoal)
    private readonly weightGoalRepsitory: Repository<WeightGoal>,
  ) {}

  private date: string = null;
  private userId: string = null;

  async create(createWeightDto: CreateWeightDto, userId: string) {
    this.date = createWeightDto.date;
    this.userId = userId;

    await this.checkAddingIsAllowed();

    const weightRecord = this.weightsRepository.create({
      ...createWeightDto,
      user: userId,
    });
    const { id, weight, date } = await this.weightsRepository.save(
      weightRecord,
    );
    return { id, weight, date };
  }

  async update(id: number, updateWeightDto: UpdateWeightDto, userId: string) {
    const toUpdate = await this.weightsRepository.update(
      {
        id,
        user: userId,
      },
      {
        weight: updateWeightDto.weight,
      },
    );
    if (!toUpdate.affected) throw new NotFoundException();
    return this.weightsRepository.findOne(id);
  }

  async findAll(query: FindQuery, userId: string) {
    if ('month' in query && 'date' in query) {
      throw new BadRequestException(
        'Only one query parameter should be provided',
      );
    } else if ('date' in query) {
      return this.findAllFromDate(query.date, userId);
    } else if ('month' in query) {
      return this.findAllByMonth(query.month, userId);
    } else {
      throw new BadRequestException('Query parameter is needed');
    }
  }

  async remove(id: number, userId: string) {
    const toDelete = await this.weightsRepository.delete({
      user: userId,
      id,
    });
    if (!toDelete.affected) throw new NotFoundException();
  }

  async createWeightGoal(
    createWeightGoalDto: CreateWeightGoalDto,
    userId: string,
  ) {
    // first try to update, if it updates it means it is already
    // present, otherwise save a new record
    const weightToUpdate = await this.weightGoalRepsitory.update(
      {
        user: userId,
      },
      {
        ...createWeightGoalDto,
      },
    );
    if (weightToUpdate.affected) {
      return {
        date: createWeightGoalDto.date,
        weight: +createWeightGoalDto.weight,
      };
    } else {
      const weightGoalToInsert = this.weightGoalRepsitory.create({
        ...createWeightGoalDto,
        user: userId,
      });
      const { date, weight } = await this.weightGoalRepsitory.save(
        weightGoalToInsert,
      );
      return { date, weight };
    }
  }

  async findWeightGoal(userId: string) {
    const weightGoal = await this.weightGoalRepsitory.findOne({
      user: userId,
    });

    const lastWeight = await this.weightsRepository.findOne(
      {
        user: userId,
      },
      {
        order: {
          date: 'DESC',
        },
      },
    );

    if (weightGoal) {
      return {
        goalWeight: weightGoal.weight,
        gaolDate: weightGoal.date,
        lastWeight: lastWeight.weight,
      };
    } else {
      throw new NotFoundException();
    }
  }

  private async findAllByMonth(month: string, userId: string) {
    const parsedMonth = parseISO(month);
    const start = startOfMonth(parsedMonth);
    const end = endOfMonth(parsedMonth);

    return this.weightsRepository.find({
      where: {
        user: userId,
        date: Between(start, end),
      },
    });
  }

  private async findAllFromDate(date: string, userId: string) {
    const currentISODate = formatISO(new Date(), {
      format: 'extended',
      representation: 'date',
    });

    return this.weightsRepository.find({
      where: {
        user: userId,
        date: Between(date, currentISODate),
      },
      order: {
        date: 'ASC',
      },
    });
  }
  private throwRecordExist() {
    throw new UnprocessableEntityException(
      'A weight record already exists for this date',
    );
  }

  private throwDateIsNotAllowed() {
    throw new UnprocessableEntityException(
      'Adding weight record for future date is not allowed',
    );
  }

  private async checkAddingIsAllowed() {
    if (await this.doesRecordExist()) {
      this.throwRecordExist();
    }
    if (this.isAfterToday()) {
      this.throwDateIsNotAllowed();
    }
  }

  private isAfterToday() {
    const parsedDate = parseISO(this.date);
    return isAfter(parsedDate, new Date());
  }

  private doesRecordExist() {
    return this.weightsRepository.findOne({
      date: this.date,
      user: this.userId,
    });
  }
}
