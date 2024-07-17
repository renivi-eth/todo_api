import express, { Response } from 'express';
import { param } from 'express-validator';

import { knex } from '../database';
import { AppRequest } from '../lib/types/app-request';
import { bodyTaskCheck } from '../lib/variables/validation';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';

export const router = express.Router();

// Получить все задачи
router.get(
  '/tasks',

  authMiddleware,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const query = await knex('task').where({ user_id: req.user.id }).select('*');

    if (query.length === 0) {
      return res.status(200).send(`User with ${req.user.email} email has not created a task yet`);
    }
    return res.status(200).send(query);
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

    const query = await knex('task').where({ user_id: req.user.id, id: req.params.id });

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

    const query = await knex('task')
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

    const query = await knex('task')
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

    const query = await knex('task').where({ id: req.params.id, user_id: req.user.id }).del().returning('*');

    if (!query) {
      return res.status(404).send('Task not found or not authorized to delete this task');
    }
    return res.status(200).send(query);
  },
);
