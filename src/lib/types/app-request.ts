import type { Request } from 'express';
import type { IUserJWT } from './user-jwt';

// Переопределяем тип Request
export type AppRequest<
  QueryParams extends Record<string, string | undefined> = {},
  PathParams extends Record<string, string> = {},
> = Request<PathParams, {}, {}, QueryParams> & { user?: IUserJWT };
