import { body, ValidationChain } from 'express-validator';

// TODO: Убрать все .trim()

export const bodyTaskCheck: ValidationChain[] = [
  body('name', 'Name must be a string').isString().isString().trim().isLength({ min: 0, max: 30 }),
  body('description', 'Description must be a text').isString().trim(),
  // TODO: вынести ['backlog', 'in-progress', 'done'] в enum
  body('state', 'State must be only backlog, in-progress or done').isIn(['backlog', 'in-progress', 'done']),
];
