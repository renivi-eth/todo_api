import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

//Проверяет обнаружены ли ошибки при обработке параметров(query, body, params) от express-validator

export const handleReqQueryError = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(errors);
  }

  next();
};
