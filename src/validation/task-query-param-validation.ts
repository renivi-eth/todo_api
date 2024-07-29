import { TaskState } from '../lib/variables/task-state';
import { query, ValidationChain } from 'express-validator';
import { SortDirection } from '../lib/variables/sort-direction';
/*
naming - entityWhat_validate(param, body,query)Check
Валидация параметров запроса (query params) в задаче 
*/
export const taskQueryParamCheck: ValidationChain[] = [
  query('limit', 'Limit must be integer and positive').optional().isInt({ min: 1 }),

  query('state', 'State must be backlog, in-progress or done').optional().isIn(Object.values(TaskState)),

  query('sortProperty', 'sortProperty must be created_at or name').optional().isIn(['created_at', 'name']),

  query('sortDirection', 'sortDirection must be ASC or DESC').optional().isIn(Object.values(SortDirection)),
];
