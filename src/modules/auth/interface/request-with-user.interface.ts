import { Request } from 'express';
import { LoginPayloadDto } from '../dto/login-payload.dto';

export interface RequestWithUser extends Request {
  user: LoginPayloadDto;
}
