import express, { Response } from 'express';
import { body, param, ValidationChain } from 'express-validator';

import { db } from '../database';
import { AppRequest } from '../lib/types/app-request';
import { TaskEntity } from '../lib/types/task.entity';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/validate-query.middleware';

export const router = express.Router();

const bodyTaskCheck: ValidationChain[] = [
  body('name', 'Name must be a string').isString().isString().trim().isLength({ min: 0, max: 30 }),
  body('description', 'Description must be a text').isString().trim(),
  body('state', 'State must be only backlog, in-progress or done').isIn(['backlog', 'in-progress', 'done']),
];

// GET - ALL TASK
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
    {
      return res.status(200).send(task);
    }
  },
);

// GET - GET TASK BY ID
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
      return res.status(404).send(`Task by ${req.params.id} id not found`);
    }

    return res.status(200).send(task);
  },
);

// POST - CREATE TASK
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

router.put(
  '/task/:id',

  authMiddleware,

  param('id', 'ID must be UUID').trim().notEmpty().isUUID(),
  body('name', 'Name must be a string').isString().isString().trim().isLength({ min: 0, max: 30 }),
  body('description', 'Description must be a text').isString().trim(),
  body('state', 'State must be only backlog, in-progress or done').isIn(['backlog', 'in-progress', 'done']),

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
