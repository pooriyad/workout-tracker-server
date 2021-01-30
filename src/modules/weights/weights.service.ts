import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { formatISO, isAfter, parseISO } from 'date-fns';
import { Between, Repository } from 'typeorm';
import { CreateWeightDto } from './dto/create-weight.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import { Weight } from './entities/weight.entity';

@Injectable()
export class WeightsService {
  constructor(
    @InjectRepository(Weight)
    private readonly weightsRepository: Repository<Weight>,
  ) {}

  private measurementDate: string = null;
  private userId: string = null;

  async create(createWeightDto: CreateWeightDto, userId: string) {
    this.measurementDate = createWeightDto.measurementDate;
    this.userId = userId;

    await this.checkAddingIsAllowed();

    const weightRecord = this.weightsRepository.create({
      ...createWeightDto,
      user: userId,
    });
    const { id, weight, measurementDate } = await this.weightsRepository.save(
      weightRecord,
    );
    return { id, weight, measurementDate };
  }

  async findAllFromDate(date: string, userId: string) {
    const currentISODate = formatISO(new Date(), {
      format: 'extended',
      representation: 'date',
    });

    return this.weightsRepository.find({
      where: {
        user: userId,
        measurementDate: Between(date, currentISODate),
      },
    });
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

  async remove(id: number, userId: string) {
    const toDelete = await this.weightsRepository.delete({
      user: userId,
      id,
    });
    if (!toDelete.affected) throw new NotFoundException();
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
    const parsedMeasurementDate = parseISO(this.measurementDate);
    return isAfter(parsedMeasurementDate, new Date());
  }

  private doesRecordExist() {
    return this.weightsRepository.findOne({
      measurementDate: this.measurementDate,
      user: this.userId,
    });
  }
}
