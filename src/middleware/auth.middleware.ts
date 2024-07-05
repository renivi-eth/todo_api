import { NextFunction } from 'express';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

dotenv.config();

export const authMiddleware = (req: Request & { user: string | JwtPayload }, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(403).send('User is not authenticated');
      return;
    }

    const decodedData = jwt.verify(token, process.env.SECRET_JWT as string);

    console.log(decodedData);
    req.user = decodedData;
   

    next();
  } catch {
    res.status(403).send('User is not authenticated');
    return;
  }
};
