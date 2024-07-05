import express from 'express';
import { body, check, param, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { validateQuery } from '../middleware/validatequery.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { IUserJWT } from '../lib/types/user-jwt';
import db from '../lib/database';

import { ICreateTask } from '../lib/types/create-task';

import { TaskEntity } from '../lib/types/task.entity';
import { UserEntity } from '../lib/types/user.entity';

dotenv.config();
export const router = express.Router();

// Get all task
router.get(
  '/tasks',
  // TODO: пока без параметров работем
  // check('completed', 'completed must be boolean value').optional().trim().notEmpty().isBoolean(),
  // check('sort', `sort must be string`).optional().trim().isString(),
  // check('state', 'state must be backlog, in-progress or done')
  //   .optional()
  //   .trim()
  //   .notEmpty()
  //   .isString()
  //   .isIn(['backlog', 'in-progress', 'done']),
  // check('page', 'page must be number').optional().trim(),
  // check('limit', 'limit must be number').optional().trim().isNumeric(),

  validateQuery,
  // @ts-ignore
  authMiddleware,

  async (req: Request & { user: IUserJWT }, res: Response) => {
    // TODO: бесмысленная проверка при наличии authMiddleware
    const {
      rows: [user],
    } = await db.query<UserEntity>('SELECT id FROM "user" WHERE id = $1', [req.user.id]);
    console.log(user.id);
    if (!user) {
      return res.status(409).send(`User not found`);
    }

    const { rows: task } = await db.query<TaskEntity>(
      'SELECT task.*, tag.name FROM task JOIN tag ON task.user_id = tag.user_id WHERE task.user_id = $1',
      [req.user.id],
    );
    res.status(200).send(task);
  },
);

// Create Task
router.post(
  '/task',

  body('name', 'Title is required or must be min 3 and max 300 symbols')
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
  validateQuery,

  // @ts-ignore
  authMiddleware,
  // @ts-ignore
  async (req: Request<ICreateTask> & { user: IUserJWT }, res: Response) => {
    const { name, description, tags, state } = req.body;
    const userId = req.user.id;

    const {
      rows: [task],
    } = await db.query<TaskEntity>(
      'INSERT INTO task(name, description,state, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, state, userId],
    );

    const uniqTags = Array.from(new Set(tags));

    const {
      rows: [tag],
    } = await db.query<TaskEntity>('INSERT INTO tag (name, user_id) VALUES($1,$2) RETURNING *', [uniqTags, userId]);

    await db.query<TaskEntity>(`INSERT INTO task_tag (task_id, tag_id) VALUES ($1, $2)`, [task.id, tag.id]);

    res.status(201).send(task);
  },
);

// Get task by ID

router.get(
  '/task/:id',

  param('id').trim().notEmpty().isUUID(),

  validateQuery,

  // @ts-ignore
  authMiddleware,

  // @ts-ignore
  async (req: Request<ICreateTask> & { user: IUserJWT }, res: Response) => {
    const id = req.params.id;

    const {
      rows: [task],
    } = await db.query(
      'SELECT task.*, tag.name FROM task JOIN tag ON task.user_id = tag.user_id WHERE task.user_id = $1 AND task.id = $2',
      [req.user.id, id],
    );

    if (!task) {
      res.status(404).send(`Task by ${id} not found`);
    }

    res.status(200).send(task);
  },
);
