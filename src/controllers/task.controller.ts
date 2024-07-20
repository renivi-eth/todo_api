import express, { Response } from 'express';
import { param } from 'express-validator';

import { knex } from '../database';

import { AppRequest } from '../lib/types/app-request';
import { TaskEntity } from '../lib/types/task.entity';
import { TaskState } from '../lib/variables/task-state';
import { IQueryParam } from '../lib/types/query-params';
import { bodyTaskCheck } from '../validation/body-task-check';
import { queryParamCheck } from '../validation/query-param-check';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';

export const router = express.Router();

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

    const query = knex<TaskEntity>('task').where({ user_id: req.user.id }).select('*');

    const queryParam: IQueryParam = {
      limit: Number(req.query.limit),
      state: req.query.state as TaskState,
    };

    switch (req.query.state) {
      case 'backlog':
        queryParam.state = TaskState.BACKLOG;
        break;
      case 'in-progress':
        queryParam.state = TaskState.IN_PROGRESS;
        break;
      case 'done':
        queryParam.state = TaskState.DONE;
        break;
    }

    if (queryParam.limit) {
      query.limit(queryParam.limit);
    }
    if (queryParam.state) {
      query.where({ state: queryParam.state });
    }

    const getAllTask = await query;

    if (getAllTask.length === 0) {
      return res.status(200).send(`User with ${req.user.email} email has not created a task yet`);
    }

    return res.status(200).send(getAllTask);
  },
);

// Получить все задачи по ID
router.get(
  '/task/:id',

  authMiddleware,

  param('id').trim().notEmpty().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const query = await knex<TaskEntity>('task').where({ user_id: req.user.id, id: req.params.id });

    if (query.length === 0) {
      return res.status(404).send(`Task by ${req.params.id} ID not found`);
    }
    return res.status(200).send(query);
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

    const { name, description, state } = req.body;

    const query = await knex<TaskEntity>('task')
      .insert({
        name: name,
        description: description,
        state: state,
        user_id: req.user.id,
      })
      .returning('*');

    return res.status(201).send(query);
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
