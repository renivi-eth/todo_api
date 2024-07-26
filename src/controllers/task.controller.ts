import express, { Response } from 'express';

import { knex } from '../database';

import { AppRequest } from '../lib/types/app-request';
import { TaskEntity } from '../lib/types/task.entity';

import { authMiddleware } from '../lib/middleware/auth.middleware';
import { taskBodyCheck } from '../validation/task-body-validation';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { taskQueryParamCheck } from '../validation/task-query-param-validation';
import { taskTagParamIDCheck } from '../validation/taskTag-param-id-validation';

export const router = express.Router();

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

    const query = knex<TaskEntity>('task').select('*').where({ user_id: req.user.id }).returning('*');

    if (req.query.limit) {
      query.limit(Number(req.query.limit));
    }
    if (req.query.state) {
      query.where({ state: req.query.state });
    }
    if (req.query.sortDirection && req.query.sortProperty) {
      query.orderBy(String(req.query.sortProperty), String(req.query.sortDirection));
    }

    const finalResWithParam = await query;

    res.status(200).send(finalResWithParam);
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

    const { name, description, state }: Partial<TaskEntity> = req.body;

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

    const { name, description, state }: Partial<TaskEntity> = req.body;

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
