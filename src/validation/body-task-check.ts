import { body, ValidationChain } from 'express-validator';
import { TaskState } from '../lib/variables/task-state';

// TODO: убрать все trim()

/*
Валидация данных в теле запроса (body) при создании задачи (POST)
*/
export const bodyTaskCheck: ValidationChain[] = [
  body('name', 'Name must be a "string", not over 30 symbols').isString().isLength({ min: 0, max: 30 }),
  body('description', 'Description must be a text').isString(),
  body('state', 'State must be only backlog, in-progress or done').isIn([Object.values(TaskState)]),
];
