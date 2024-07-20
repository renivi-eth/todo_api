import { body, ValidationChain } from 'express-validator';

export const bodyTaskCheck: ValidationChain[] = [
  body('name', 'Name must be a string').isString().isString().trim().isLength({ min: 0, max: 30 }),
  body('description', 'Description must be a text').isString().trim(),
  body('state', 'State must be only backlog, in-progress or done').isIn(['backlog', 'in-progress', 'done']),
];
