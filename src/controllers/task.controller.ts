import express, { Response } from 'express';
import { param } from 'express-validator';

import { knex } from '../database';

import { AppRequest } from '../lib/types/app-request';
import { TaskEntity } from '../lib/types/task.entity';

import { SortDirection } from '../lib/variables/sort';
import { TaskState } from '../lib/variables/task-state';
import { IQueryParam } from '../lib/types/query-params';
import { bodyTaskCheck } from '../validation/task-body-validation';
import { queryParamCheck } from '../validation/task-query-param-validation';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';

export const router = express.Router();

// TODO: Научиться передавать тип QueryParams в параметры запроса

// Получить все задачи
router.get(
  '/tasks',

  ...queryParamCheck,

  authMiddleware,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const query = knex<TaskEntity>('task').select('*');

    const queryParam: IQueryParam = {
      limit: Number(req.query.limit),
      state: req.query.state as TaskState,
      sortColumn: String(req.query.sort),
      direction: null,
    };

    switch (req.query.sort) {
      case 'created-at':
        queryParam.sortColumn = 'created_at';
        queryParam.direction = SortDirection.DESC;
        break;
      case 'name':
        queryParam.sortColumn = 'name';
        queryParam.direction = SortDirection.ASC;
        break;
      default:
        queryParam.sortColumn = 'name';
        queryParam.direction = SortDirection.ASC;
        break;
    }

    if (queryParam.limit) {
      query.limit(queryParam.limit);
    }

    if (req.query.state) {
      query.where({ state: req.query.state });
    }

    if (req.query.sort) {
      query.orderBy(queryParam.sortColumn, queryParam.direction);
    }

    const getAllTask = await query;

    return res.status(200).send(getAllTask);
  },
);

// Получить задачу по ID
router.get(
  '/task/:id',

  authMiddleware,

  // TODO: Убрать в отдельную функцию
  param('id').trim().notEmpty().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const task = await knex<TaskEntity>('task').where({ user_id: req.user.id, id: req.params.id }).first();

    if (!task) {
      return res.status(404).send(`Task by ${req.params.id} ID not found`);
    }

    return res.status(200).send(task);
  },
);

// Создать задачу
router.post(
  '/task',

  authMiddleware,

  ...bodyTaskCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    // TODO: Обозначить типы явно
    const { name, description, state } = req.body;

    const [task] = await knex<TaskEntity>('task')
      .insert({
        name: name,
        description: description,
        state: state,
        user_id: req.user.id,
      })
      .returning('*');

    return res.status(201).send(task);
  },
);

// Обновить задачу по ID
router.put(
  '/task/:id',

  authMiddleware,

  param('id', 'ID must be UUID').trim().notEmpty().isUUID(),
  ...bodyTaskCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const { name, description, state } = req.body;

    const query = await knex<TaskEntity>('task')
      .where({ user_id: req.user.id, id: req.params.id })
      .update({
        name: name,
        description: description,
        state: state,
        updated_at: knex.fn.now(),
      })
      .returning('*');

    return res.status(201).send(query);
  },
);

// Удалить задачу по ID
router.delete(
  '/task/:id',

  authMiddleware,

  param('id').trim().notEmpty().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const query = await knex<TaskEntity>('task')
      .where({ id: req.params.id, user_id: req.user.id })
      .del()
      .returning('*');

    if (!query) {
      return res.status(404).send('Task not found or not authorized to delete this task');
    }
    return res.status(200).send(query);
  },
);
