import express, { Response } from 'express';
import { param } from 'express-validator';

import { knex } from '../database';

import { AppRequest } from '../lib/types/app-request';
import { TaskEntity } from '../lib/types/task.entity';

import { TaskState } from '../lib/variables/task-state';
import { IQueryParam } from '../lib/types/query-params';
import { SortDirection } from '../lib/variables/sort-direction';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { taskBodyCheck } from '../validation/task-body-validation';
import { taskTagParamIDCheck } from '../validation/taskTag-param-id-validation';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { taskQueryParamCheck } from '../validation/task-query-param-validation';

export const router = express.Router();

// TODO: Научиться передавать тип QueryParams в параметры запроса, не писать отдельно;
// Получить все задачи
router.get(
  '/tasks',

  ...taskQueryParamCheck,

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
      query.where({ state: queryParam.state });
    }

    if (req.query.sort) {
      query.orderBy(queryParam.sortColumn, queryParam.direction);
    }

    const getAllTask = await query;

    res.status(200).send(getAllTask);
    return;
  },
);

// Получить задачу по ID
router.get(
  '/task/:id',

  authMiddleware,

  taskTagParamIDCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const task = await knex<TaskEntity>('task').where({ user_id: req.user.id, id: req.params.id }).first();

    if (!task) {
      res.status(404).send(`Task by ${req.params.id} ID not found`);
      return;
    }

    res.status(200).send(task);
    return;
  },
);

// Создать задачу
router.post(
  '/task',

  authMiddleware,

  ...taskBodyCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const { name, description, state }: TaskEntity = req.body;

    const [task] = await knex<TaskEntity>('task')
      .insert({
        name: name,
        description: description,
        state: state,
        user_id: req.user.id,
      })
      .returning('*');

    res.status(201).send(task);
    return;
  },
);

// Обновить задачу по ID
router.put(
  '/task/:id',

  authMiddleware,

  taskTagParamIDCheck,
  ...taskBodyCheck,

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

    res.status(201).send(query);
    return;
  },
);

// Удалить задачу по ID
router.delete(
  '/task/:id',

  authMiddleware,

  taskTagParamIDCheck,

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
      res.status(404).send('Task not found or not authorized to delete this task');
      return;
    }
    res.status(200).send(query);
    return;
  },
);
