import { ExpressValidator, check, validationResult } from 'express-validator';
import express, { Request, Response, NextFunction } from 'express';

export const validateQuery = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    return res.status(400).send(errors);
  }
  next();
};
