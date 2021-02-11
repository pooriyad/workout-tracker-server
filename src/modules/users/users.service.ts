import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostgresErrorCodes } from '../database/postgres-error-codes.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    try {
      await this.usersRepository.save(user);

      return {
        success: true,
        message: 'User was successfully registered.',
      };
    } catch (error) {
      if (error.code === PostgresErrorCodes.UniqueViolation) {
        throw new BadRequestException('A user with this email already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async setRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  removeRefreshToken(userId: string) {
    this.usersRepository.update(userId, {
      refreshToken: null,
    });
  }

  async getUserWithRefreshToken(email: string, refreshToken: string) {
    const user = await this.usersRepository.findOne({ email });

    try {
      const isRefreshTokenMatched = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (isRefreshTokenMatched) return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ email });
  }

  getUserProfile(email: string) {
    return this.usersRepository.findOne({ email }, { relations: ['profile'] });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Todo: if request body is empty return
    const toUpdate = await this.usersRepository.findOne(
      { id: userId },
      { relations: ['profile'] },
    );

    toUpdate.profile = Object.assign(toUpdate.profile, { ...updateProfileDto });

    return this.usersRepository.save(toUpdate).then(() => {
      return toUpdate.profile;
    });
  }
}
