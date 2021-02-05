import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/login-payload.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { RequestWithUser } from './interface/request-with-user.interface';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
  })
  async login(@Req() request: RequestWithUser) {
    const { user } = request;
    this.authService.setUser(user);

    const cookies = this.authService.createTokenCookies();

    await this.authService.setRefreshToken();

    request.res.setHeader('Set-cookie', cookies);

    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Req() request: RequestWithUser) {
    this.authService.setUser(request.user);

    const newAccessTokenCookie = this.authService.createAccessTokenCookie();

    request.res.setHeader('Set-Cookie', newAccessTokenCookie);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: RequestWithUser) {
    request.res.setHeader('Set-Cookie', this.authService.removeTokenCookies());
    await this.authService.removeRefreshToken(request.user.id);
  }
}
