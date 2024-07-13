import { body, ValidationChain } from 'express-validator';

// Auth.controller.ts

export const emailPassCheck: ValidationChain[] = [
  body('email', 'Email cannot be empty').trim().isEmail(),
  body('password', 'Password must be more 4 symbols and not over 15 symbols').trim().isLength({ min: 4, max: 15 }),
];

// Task.controller.ts

export const bodyTaskCheck: ValidationChain[] = [
  body('name', 'Name must be a string').isString().isString().trim().isLength({ min: 0, max: 30 }),
  body('description', 'Description must be a text').isString().trim(),
  body('state', 'State must be only backlog, in-progress or done').isIn(['backlog', 'in-progress', 'done']),
];

// Tags.controller.ts

export const tagNameCheck = body('name', 'Tag is required or must be min 3 and max 50 symbols')
  .isString()
  .isLength({ min: 3, max: 50 });
