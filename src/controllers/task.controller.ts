import express, { Response } from 'express';

import { knex } from '../database';

import { AppRequest } from '../lib/types/app-request';
import { TaskEntity } from '../lib/types/task.entity';

import { taskBodyCheck } from '../validation/task-body-validation';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { taskQueryParamCheck } from '../validation/task-query-param-validation';
import { taskTagParamIDCheck } from '../validation/taskTag-param-id-validation';

export const router = express.Router();

// Получить все задачи
router.get(
  '/tasks',

  authMiddleware,

  ...taskQueryParamCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const taskQueryBuilder = knex<TaskEntity>('task').select('*').where({ user_id: req.user.id }).returning('*');

    if (req.query.limit) {
      taskQueryBuilder.limit(Number(req.query.limit));
    }
    if (req.query.state) {
      taskQueryBuilder.where({ state: req.query.state });
    }
    if (req.query.sortDirection && req.query.sortProperty) {
      taskQueryBuilder.orderBy(String(req.query.sortProperty), String(req.query.sortDirection));
    }

    const tasks = await taskQueryBuilder;

    res.status(200).send(tasks);
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

    const taskQueryBuilderById = await knex<TaskEntity>('task')
      .where({ user_id: req.user.id, id: req.params.id })
      .first();

    if (!taskQueryBuilderById) {
      res.status(404).send(`Task by ${req.params.id} ID not found`);
      return;
    }

    res.status(200).send(taskQueryBuilderById);
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

    const { name, description, state }: Partial<TaskEntity> = req.body;

    const [taskQueryBuilderCreate] = await knex<TaskEntity>('task')
      .insert({
        name: name,
        description: description,
        state: state,
        user_id: req.user.id,
      })
      .returning('*');

    res.status(201).send(taskQueryBuilderCreate);
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

    const { name, description, state }: Partial<TaskEntity> = req.body;

    const [taskQueryBuilderUpdate] = await knex<TaskEntity>('task')
      .where({ user_id: req.user.id, id: req.params.id })
      .update({
        name: name,
        description: description,
        state: state,
        updated_at: knex.fn.now(),
      })
      .returning('*');

    res.status(201).send(taskQueryBuilderUpdate);
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

    const [taskQueryBuilderDelete] = await knex<TaskEntity>('task')
      .where({ id: req.params.id, user_id: req.user.id })
      .del()
      .returning('*');

    if (!taskQueryBuilderDelete) {
      res.status(404).send('Task not found or not authorized to delete this task');
      return;
    }
    res.status(200).send(taskQueryBuilderDelete);
    return;
  },
);
