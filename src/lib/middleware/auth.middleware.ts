import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';

import { IUserJWT } from '../types/user-jwt';
import { AppRequest } from '../types/app-request';

/**
 * Middleware который проверяет наличие токена в заголовке запроса и его валидность.
 * Добавляет в тело запроса, объект user с данными пользователя.
 */
export const authMiddleware = (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  if (!req.headers.authorization) {
    res.status(401).send('Authorization header is required');
    return;
  }

  try {
    const [, token] = req.headers.authorization.split(' ');

    if (!token) {
      res.status(401).send('Authorization token is required');
      return;
    }

    const decodedData = jwt.verify(token, process.env.SECRET_JWT as string) as IUserJWT;

    if (!decodedData.email || !decodedData.id) {
      res.status(401).send('Invalid authorization token');
      return;
    }

    req.user = decodedData;
    console.log(decodedData);

    next();
  } catch {
    res.status(403).send('User is not authenticated');
    return;
  }
};
