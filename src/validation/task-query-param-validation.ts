import { query, ValidationChain } from 'express-validator';

export const queryParamCheck: ValidationChain[] = [
  query('limit', 'Limit must be integer and positive').optional().trim().isInt({ min: 1 }),

  query('state', 'State must be "backlog", "in-progress" or "done"')
    .optional()
    .trim()
    // TODO: Вынести в enum
    .isIn(['backlog', 'in-progress', 'done']),

  query('sort', 'Sort mut be created-at or name').optional().trim().isIn(['created-at', 'name']),
];
