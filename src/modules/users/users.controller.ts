import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interface/request-with-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfilePayload } from './dto/profile-payload.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({
    summary: 'Gets the authenticated user profile',
  })
  @ApiOkResponse({
    type: ProfilePayload,
  })
  @Get()
  findMe(@Req() request: RequestWithUser) {
    return this.userService.getUserProfile(request.user.email);
  }
}
