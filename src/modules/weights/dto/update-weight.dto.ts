import { PickType } from '@nestjs/swagger';
import { CreateWeightDto } from './create-weight.dto';

export class UpdateWeightDto extends PickType(CreateWeightDto, ['weight']) {}
