import { Request } from 'express';
import { IUserJWT } from './user-jwt';

export interface AppRequest extends Request {
  user?: IUserJWT;
}
