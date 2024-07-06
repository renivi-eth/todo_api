import express, { Response } from 'express';
import { body, param } from 'express-validator';

import db from '../lib/database';
import { TagsEntity } from '../lib/types/tags.entity';
import { AppRequest } from '../lib/types/app-request';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validatequery.middleware';

export const routerTags = express.Router();

routerTags.get(
  '/tags/:id',

  param('id', 'ID must be UUID').trim().notEmpty().isUUID(),

  validateQuery,

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

    return res.status(200).send(tags.name);
  },
);

routerTags.post(
  '/tags',

  body('tags', 'Tags must be only backlog, in-progress or done').isIn(['backlog', 'in-progress', 'done']),

  validateQuery,

  //@ts-ignore
  authMiddleware,

  async (req: AppRequest, res: Response) => {
    res.send(req.user);
  },
);
