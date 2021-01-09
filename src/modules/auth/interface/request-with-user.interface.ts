import { Request } from 'express';
import { TokenPayload } from './token-payload.interface';
export interface RequestWithUser extends Request {
  user: TokenPayload;
}
