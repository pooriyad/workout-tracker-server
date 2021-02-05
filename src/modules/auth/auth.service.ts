import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginPayloadDto } from './dto/login-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  user: LoginPayloadDto = null;

  setUser(user: LoginPayloadDto) {
    this.user = user;
  }

  register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.isPasswordValid(password, user.password))) {
      return user;
    }
    return null;
  }

  private isPasswordValid(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  createRefreshToken() {
    return this.createJwtToken('REFRESH');
  }

  createAccessToken() {
    return this.createJwtToken('ACCESS');
  }

  createJwtToken(tokenType: 'REFRESH' | 'ACCESS') {
    const payload = { email: this.user.email, sub: this.user.id };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get(`JWT_${tokenType}_TOKEN_SECRET`),
      expiresIn: this.configService.get(
        `JWT_${tokenType}_TOKEN_EXPIRATION_TIME`,
      ),
    });

    return token;
  }

  createRefreshTokenCookie() {
    const token = this.createRefreshToken();
    return this.createJwtTokenCookie(token, 'Refresh');
  }

  createAccessTokenCookie() {
    const token = this.createAccessToken();
    return this.createJwtTokenCookie(token, 'Access');
  }

  createTokenCookies() {
    const refreshTokenCookie = this.createRefreshTokenCookie();
    const accessTokenCookie = this.createAccessTokenCookie();
    return [refreshTokenCookie, accessTokenCookie];
  }

  removeTokenCookies() {
    return [
      `Access-Token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`,
      `Refresh-Token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`,
    ];
  }

  createJwtTokenCookie(token: string, tokenType: 'Refresh' | 'Access') {
    // convert expiration time from milliseconds to seconds
    // because jsonwebtoken interprets numbers as milliseconds and
    // Max-Age interprets numbers as seconds
    const maxAge =
      +this.configService.get(
        `JWT_${tokenType.toUpperCase()}_TOKEN_EXPIRATION_TIME`,
      ) / 1000;

    return `${tokenType}-Token=${token}; HttpOnly; Secure; Path=/; Max-Age=${maxAge}; SameSite=Strict`;
  }

  async setRefreshToken() {
    const refreshToken = this.createRefreshToken();
    await this.usersService.setRefreshToken(this.user.id, refreshToken);
  }

  async removeRefreshToken(userId: string) {
    return this.usersService.removeRefreshToken(userId);
  }
}
