import express, { Response } from 'express';
import { param } from 'express-validator';

import { knex } from '../database';
import { TagEntity } from '../lib/types/tag.entity';

import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { AppRequest } from '../lib/types/app-request';
import { tagNameCheck } from '../lib/variables/validation';

export const router = express.Router();

// Получить все тэги
router.get(
  '/tags',

  authMiddleware,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const query = await knex<TagEntity>('tag').where({ user_id: req.user.id });

    if (query.length === 0) {
      return res.status(404).send('Tags not found or not authorized');
    }

    return res.status(200).send(query);
  },
);

// Получить тэги по ID
router.get(
  '/tags/:id',

  authMiddleware,

  param('id', 'ID must be UUID').trim().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const query = await knex<TagEntity>('tag').where({ id: req.params.id, user_id: req.user.id });

    if (query.length === 0) {
      return res.status(404).send(`Tags by ${req.params.id} id not found`);
    }

    return res.status(200).send(query);
  },
);

// Создать новый тэг
router.post(
  '/tags',

  authMiddleware,

  tagNameCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const [query] = await knex<TagEntity>('tag').insert({ name: req.body.name, user_id: req.user.id }).returning('*');

    return res.status(201).send(query);
  },
);

// Обновить тэг
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

    const [query] = await knex<TagEntity>('tag')
      .where({ id: req.params.id, user_id: req.user.id })
      .update({ name: req.body.name })
      .returning('*');

    return res.status(201).send(query);
  },
);

// Удалить тэг по ID
router.delete(
  '/tag/:id',

  authMiddleware,

  param('id', 'ID must be UUID').trim().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const [query] = await knex<TagEntity>('tag')
      .where({ id: req.params.id, user_id: req.user.id })
      .del()
      .returning('*');

    if (!query) {
      return res.status(400).send('Tags not found');
    }

    return res.status(200).send(query);
  },
);
