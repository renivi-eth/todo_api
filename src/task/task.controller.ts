import express from 'express';
import { body, check, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { validateQuery } from '../middleware/validatequery.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { IUserJWT } from '../lib/types/user-jwt';
import db from '../lib/database';
import { ICreateTask } from '../lib/types/create-task';

dotenv.config();
export const router = express.Router();

// Get all task

router.get(
  '/postgres/tasks',

  check('completed', 'completed must be boolean value').optional().trim().notEmpty().isBoolean(),
  check('sort', `sort must be string`).optional().trim().isString(),
  check('state', 'state must be backlog, in-progress or done')
    .optional()
    .trim()
    .notEmpty()
    .isString()
    .isIn(['backlog', 'in-progress', 'done']),
  check('page', 'page must be number').optional().trim(),
  check('limit', 'limit must be number').optional().trim().isNumeric(),

  validateQuery,
  // @ts-ignore
  authMiddleware,

  async (req: Request & { user: IUserJWT }, res: Response) => {
    const {
      rows: [user],
    } = await db.query('SELECT id FROM "user" WHERE id = $1', [req.user.id]);

    if (user) {
      console.log('This user have in DB');
      const {
        rows: [user],
      } = await db.query('SELECT * FROM task WHERE user_id = $1', [req.user.id]);
      console.log(user);
    }
  },
);

router.post(
  '/postgres/task',

  body('title', 'Title is required or must be min 3 and max 300 symbols')
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
    const UniqTags = Array.from(new Set(tags));
  },
);
