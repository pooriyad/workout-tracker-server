import { Module } from '@nestjs/common';
import { WeightsService } from './weights.service';
import { WeightsController } from './weights.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weight } from './entities/weight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Weight])],
  controllers: [WeightsController],
  providers: [WeightsService],
})
export class WeightsModule {}
