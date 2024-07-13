import express, { Response } from 'express';
import { param } from 'express-validator';

import { db } from '../database';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { AppRequest } from '../lib/types/app-request';
import { TagEntity } from '../lib/types/tag.entity';
import { tagNameCheck } from '../lib/variables/validation';

export const router = express.Router();

router.get(
  '/tags',

  authMiddleware,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const { rows: tags } = await db.query<TagEntity>('SELECT * FROM tag WHERE user_id = $1', [req.user.id]);

    if (!tags) {
      res.status(404).send('Tags not found or not authorized');
      return;
    }

    res.status(200).send(tags);
    return;
  },
);

router.get(
  '/tags/:id',

  authMiddleware,

  param('id', 'ID must be UUID').trim().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const {
      rows: [tag],
    } = await db.query<TagEntity>('SELECT * FROM tag WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    if (!tag) {
      return res.status(404).send(`Tags by ${req.params.id} id not found`);
    }

    return res.status(200).send(tag);
  },
);

router.post(
  '/tags',

  authMiddleware,

  tagNameCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const {
      rows: [tag],
    } = await db.query<TagEntity>('INSERT INTO tag (name, user_id) VALUES ($1, $2) RETURNING *', [
      req.body.name,
      req.user.id,
    ]);

    return res.status(201).send(tag);
  },
);

router.put(
  '/tags/:id',

  authMiddleware,

  param('id', 'ID must be UUID').isUUID(),
  tagNameCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const {
      rows: [tag],
    } = await db.query<TagEntity>('UPDATE tag SET name = $2 WHERE id = $1 AND user_id = $3 RETURNING *', [
      req.params.id,
      req.body.name,
      req.user.id,
    ]);

    return res.status(201).send(tag);
  },
);

router.delete(
  '/tag/:id',

  authMiddleware,

  param('id', 'ID must be UUID').trim().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const {
      rows: [tag],
    } = await db.query<TagEntity>('DELETE FROM tag WHERE id = $1 AND user_id = $2 RETURNING *', [
      req.params.id,
      req.user.id,
    ]);

    return res.status(200).send(tag);
  },
);

// TODO: вынести все проверки на начилие в req user в отдельную функцию;
// TODO: работа с валидацией, работа с параметрами / телом запроса;
