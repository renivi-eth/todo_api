import { body } from 'express-validator';

export const tagNameCheck = body('name', 'Tag is required or must be min 3 and max 50 symbols')
  .isString()
  .isLength({ min: 3, max: 50 });