import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { WeightsService } from './weights.service';
import { CreateWeightDto } from './dto/create-weight.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { WeightPayload } from './dto/weight-payload.dto';
import { UnprocessableError } from './dto/unprocessable-error.dto';
import { FindQuery } from './dto/find-query.dto';

@ApiTags('Weights')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('weights')
export class WeightsController {
  constructor(private readonly weightsService: WeightsService) {}

  @ApiOperation({
    summary: 'Creates a new weight record',
  })
  @ApiCreatedResponse({
    type: WeightPayload,
  })
  @ApiUnprocessableEntityResponse({
    type: UnprocessableError,
    description: `One of the following cause the error:
   1. The record already exists for the specified date.
   2. Adding a record for future date.`,
  })
  @Post()
  create(@Body() createWeightDto: CreateWeightDto, @UserId() userId: string) {
    return this.weightsService.create(createWeightDto, userId);
  }

  @ApiOperation({
    summary: 'Returns weight records based on query',
    description:
      'One query parameter must be provided. Either "month" or "date".',
  })
  @ApiQuery({
    type: FindQuery,
  })
  @ApiOkResponse({
    type: WeightPayload,
    isArray: true,
  })
  @Get()
  findAll(@Query() query: FindQuery, @UserId() userId: string) {
    return this.weightsService.findAll(query, userId);
  }

  @ApiOperation({
    summary: 'Updates a weight record',
  })
  @ApiOkResponse({
    type: WeightPayload,
  })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateWeightDto: UpdateWeightDto,
    @UserId() userId: string,
  ) {
    return this.weightsService.update(+id, updateWeightDto, userId);
  }

  @ApiOperation({
    summary: 'Deletes a weight record',
  })
  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.weightsService.remove(+id, userId);
  }
}
