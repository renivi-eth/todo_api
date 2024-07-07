import express, { Response } from 'express';
import { body, param } from 'express-validator';

import { db } from '../database';
import { TagsEntity } from '../lib/types/tags.entity';
import { AppRequest } from '../lib/types/app-request';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/validate-query.middleware';

export const router = express.Router();

router.get(
  '/tags/:id',

  param('id', 'ID must be UUID').trim().notEmpty().isUUID(),

  handleReqQueryError,

  authMiddleware,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const id = req.params.id;
    const userId = req.user.id;

    const {
      rows: [tags],
    } = await db.query<TagsEntity>(
      'SELECT * FROM task_tag JOIN tag ON task_tag.tag_id = tag.id WHERE task_id = $1 AND user_id = $2',
      [id, userId],
    );

    if (!tags) {
      res.status(404).send('Tags not found or not authorized');
    }

    return res.status(200).send(tags);
  },
);

router.post(
  '/tags/:id',

  body('tags', 'Tags must be an array with string values or not empty').notEmpty().isArray(),

  handleReqQueryError,

  //@ts-ignore
  authMiddleware,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const tag = req.body.tags;
    const id = req.params.id;
    const userId = req.user.id;

    const uniqTag = [...new Set(tag)];
    const unitTagStr: string = uniqTag.join(' ');
    console.log(unitTagStr);

    const {
      rows: [tags],
    } = await db.query<TagsEntity>(
      `
    WITH ins_tag AS (
        -- Вставляем тег, если его еще нет, и возвращаем его id
        INSERT INTO tag(name)
        SELECT $1
        WHERE NOT EXISTS (
            SELECT 1 FROM tag WHERE name = $1
        )
        RETURNING id
    )
    -- Вставляем запись в task_tag с использованием вставленного или существующего тега
    INSERT INTO task_tag(task_id, tag_id)
    SELECT $2, COALESCE((SELECT id FROM ins_tag), (SELECT id FROM tag WHERE name = $1))
    RETURNING *;
`,
      [unitTagStr, id],
    );

    console.log(unitTagStr);
  },
);

router.put(
  '/tags/:id',

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

  async (req: AppRequest, res: Response) => {},
);
