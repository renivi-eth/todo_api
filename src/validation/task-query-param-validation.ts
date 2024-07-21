import { query, ValidationChain } from 'express-validator';
import { TaskState } from '../lib/variables/task-state';

export const queryParamCheck: ValidationChain[] = [
  query('limit', 'Limit must be integer and positive').optional().isInt({ min: 1 }),

  query('state', 'State must be "backlog", "in-progress" or "done"')
    .optional()
    .isIn([Object.values(TaskState)]),

  query('sort', 'Sort mut be created-at or name').optional().isIn(['created-at', 'name']),
];
