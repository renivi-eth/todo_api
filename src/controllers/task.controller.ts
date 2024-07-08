import dotenv from 'dotenv';
import express, { Response } from 'express';

import { db } from '../database';
import { body, param } from 'express-validator';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/validate-query.middleware';

import { IUserJWT } from '../lib/types/user-jwt';
import { AppRequest } from '../lib/types/app-request';
import { TaskEntity } from '../lib/types/task.entity';
import { UserEntity } from '../lib/types/user.entity';

dotenv.config();
export const router = express.Router();

// Get all task
router.get(
  '/tasks',

  handleReqQueryError,

  authMiddleware,

  async (req: AppRequest, res: Response) => {
    // TODO: бесмысленная проверка при наличии authMiddleware?
    const {
      rows: [user],
    } = await db.query<UserEntity>('SELECT id FROM "user" WHERE id = $1', [req.user?.id]);
    console.log(user.id);
    if (!user) {
      return res.status(409).send(`User not found`);
    }

    const { rows: task } = await db.query<TaskEntity>('SELECT * FROM task WHERE user_id = $1', [req.user?.id]);
    res.status(200).send(task);
  },
);

// Create Task
router.post(
  '/task',

  body('name', 'Name is required or must be min 3 and max 300 symbols')
    .isString()
    .isLength({ min: 3, max: 300 })
    .notEmpty(),
  body('description', 'Field description must be a string and max 1000 symbols')
    .optional()
    .isLength({ min: 0, max: 1000 })
    .isString(),
  body('completed', 'Completed must be boolean value').optional().trim().notEmpty().isBoolean(),
  body('tags', 'Tags must be array').optional().isArray({ min: 0, max: 30 }),
  body('state', 'State must be only backlog, in-progress or done')
    .optional()
    .notEmpty()
    .isString()
    .isIn(['backlog', 'in-progress', 'done']),

  // Middleware for body Errors
  handleReqQueryError,

  // @ts-ignore
  authMiddleware,
  // @ts-ignore
  async (req: AppRequest, res: Response) => {
    const { name, description, tags, state } = req.body;
    const userId = req.user?.id;

    const {
      rows: [task],
    } = await db.query<TaskEntity>(
      'INSERT INTO task(name, description, state, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, state, userId],
    );

    res.status(201).send(task);
  },
);

// Get task by ID
router.get(
  '/task/:id',

  param('id').trim().notEmpty().isUUID(),

  handleReqQueryError,

  // @ts-ignore
  authMiddleware,

  // @ts-ignore
  async (req: AppRequest & { user: IUserJWT }, res: Response) => {
    const id = req.params.id;

    const {
      rows: [task],
    } = await db.query('SELECT * FROM task WHERE user_id = $1 AND id = $2', [req.user.id, id]);

    if (!task) {
      res.status(404).send(`Task by ${id} not found`);
    }

    res.status(200).send(task);
  },
);

router.put(
  '/task/:id',

  param('id', 'ID must be UUID').trim().notEmpty().isUUID(),
  body('name', 'Name is required or must be min 3 and max 300 symbols')
    .isString()
    .isLength({ min: 3, max: 300 })
    .notEmpty(),
  body('description', 'Field description must be a string and max 1000 symbols')
    .optional()
    .isLength({ min: 0, max: 1000 })
    .isString(),
  body('completed', 'Completed must be boolean value').optional().trim().notEmpty().isBoolean(),
  body('tags', 'Tags must be array').optional().isArray({ min: 0, max: 30 }),
  body('state', 'State must be only backlog, in-progress or done')
    .optional()
    .notEmpty()
    .isString()
    .isIn(['backlog', 'in-progress', 'done']),

  handleReqQueryError,

  // @ts-ignore
  authMiddleware,

  // @ts-ignore
  async (req: AppRequest, res: Response) => {
    const id = req.params.id;
    const { name, description, state } = req.body;
    const userId = req.user?.id;

    const {
      rows: [task],
    } = await db.query(
      'UPDATE task SET name = $1, description = $2, state = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, description, state, id, userId],
    );

    if (!task) {
      res.status(400).send('Task not found or not authorized to delete this task!');
    }

    res.status(201).send(task);
  },
);

router.delete(
  '/task/:id',

  param('id').trim().notEmpty().isUUID(),

  handleReqQueryError,

  // @ts-ignore
  authMiddleware,

  // @ts-ignore
  async (req: AppRequest & { user: IUserJWT }, res: Response) => {
    const id = req.params.id;
    const userId = req.user.id;

    console.log(id, userId);
    const {
      rows: [task],
    } = await db.query('DELETE FROM task WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);

    if (!task) {
      res.status(404).send('Task not found or not authorized to delete this task');
    }
    return res.status(200).send(task);
  },
);
