import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { TokenPayload } from './interface/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
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

  createRefreshToken(user: TokenPayload) {
    return this.createJwtToken(user, 'REFRESH');
  }

  createAccessToken(user: TokenPayload) {
    return this.createJwtToken(user, 'ACCESS');
  }

  createJwtToken(user: TokenPayload, tokenType: 'REFRESH' | 'ACCESS') {
    const payload = { email: user.email, sub: user.id };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get(`JWT_${tokenType}_TOKEN_SECRET`),
      expiresIn: this.configService.get(
        `JWT_${tokenType}_TOKEN_EXPIRATION_TIME`,
      ),
    });

    return token;
  }

  createRefreshTokenCookie(user: TokenPayload) {
    const token = this.createRefreshToken(user);
    return this.createJwtTokenCookie(token, 'Refresh');
  }

  createAccessTokenCookie(user: TokenPayload) {
    const token = this.createAccessToken(user);
    return this.createJwtTokenCookie(token, 'Access');
  }

  createTokenCookies(user: TokenPayload) {
    const refreshTokenCookie = this.createRefreshTokenCookie(user);
    const accessTokenCookie = this.createAccessTokenCookie(user);
    return [refreshTokenCookie, accessTokenCookie];
  }

  removeTokenCookies() {
    const expireDate = new Date(0).toUTCString();

    return [
      `Access-Token=; HttpOnly; Path=/; Max-Age=0; Same-Site=Strict; Expires=${expireDate}`,
      `Refresh-Token=; HttpOnly; Path=/; Max-Age=0; Same-Site=Strict; Expires=${expireDate}`,
    ];
  }

  createJwtTokenCookie(token: string, tokenType: 'Refresh' | 'Access') {
    return `${tokenType}-Token=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      `JWT_${tokenType}_TOKEN_EXPIRATION_TIME`,
    )}; Same-Site=Strict`;
  }

  async setRefreshToken(user: TokenPayload) {
    const refreshToken = this.createRefreshToken(user);
    await this.usersService.setRefreshToken(user.id, refreshToken);
  }

  async removeRefreshToken(userId: string) {
    return this.usersService.removeRefreshToken(userId);
  }
}
