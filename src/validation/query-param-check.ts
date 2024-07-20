import { query, ValidationChain } from 'express-validator';

export const queryParamCheck: ValidationChain[] = [
  query('limit', 'Limit must be number and positive').optional().trim().isInt({ min: 1 }),
  query('state', 'State must be backlog, in-progress or done')
    .optional()
    .trim()
    .isIn(['backlog', 'in-progress', 'done']),
];
