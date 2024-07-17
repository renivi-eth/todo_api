import express, { Response } from 'express';
import { param } from 'express-validator';

import { db } from '../database';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { AppRequest } from '../lib/types/app-request';
import { TaskEntity } from '../lib/types/task.entity';
import { bodyTaskCheck } from '../lib/variables/validation';

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

    const { rows: task } = await db.query<TaskEntity>('SELECT * FROM task WHERE user_id = $1', [req.user.id]);

    if (task.length === 0) {
      return res.status(200).send(`User with ${req.user.email} email has not created a task yet`);
    }
    return res.status(200).send(task);
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

    const {
      rows: [task],
    } = await db.query('SELECT * FROM task WHERE user_id = $1 AND id = $2', [req.user.id, req.params.id]);

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

    const { name, description, state } = req.body;

    const {
      rows: [task],
    } = await db.query<TaskEntity>(
      'INSERT INTO task(name, description, state, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, state, req.user.id],
    );

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

    const {
      rows: [task],
    } = await db.query(
      'UPDATE task SET name = $1, description = $2, state = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, description, state, req.params.id, req.user.id],
    );

    if (!task) {
      return res.status(400).send('Task not found or not authorized to delete this task!');
    }

    return res.status(201).send(task);
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

    const {
      rows: [task],
    } = await db.query('DELETE FROM task WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);

    if (!task) {
      return res.status(404).send('Task not found or not authorized to delete this task');
    }
    return res.status(200).send(task);
  },
);
