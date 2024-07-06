import express, { Request, Response } from 'express';
import { check, param, validationResult } from 'express-validator';
import { IUserJWT } from '../lib/types/user-jwt';
import { removeDublicate } from '../lib/utilts/remove-dublicate';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validatequery.middleware';

import db from '../lib/database';

export const routerTags = express.Router();

routerTags.get(
  '/tags/:id',

  param('id', 'ID must be UUID').trim().notEmpty().isUUID(),

  validateQuery,
  // @ts-ignore
  authMiddleware,
  // @ts-ignore
  async (req: Request & { user: IUserJWT }, res: Response) => {
    const id = req.params.id;
    const userId = req.user.id;

    const {
      rows: [tags],
    } = await db.query(
      'SELECT * FROM task_tag JOIN tag ON task_tag.tag_id = tag.id WHERE task_id = $1 AND user_id = $2',
      [id, userId],
    );

    return res.status(200).send(tags.name);
  },
);
