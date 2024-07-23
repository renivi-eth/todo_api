import { param } from 'express-validator';
import express, { Response } from 'express';

import { knex } from '../database';

import { TagEntity } from '../lib/types/tag.entity';
import { AppRequest } from '../lib/types/app-request';
import { tagBodyCheck } from '../validation/tag-body-validation';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';

import { taskTagParamIDCheck } from '../validation/taskTag-param-id-validation';

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
      res.status(404).send('Tags not found or not authorized');
      return;
    }

    res.status(200).send(query);
    return;
  },
);

// Получить тэг по ID
router.get(
  '/tags/:id',

  authMiddleware,

  taskTagParamIDCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const query = await knex<TagEntity>('tag').where({ id: req.params.id, user_id: req.user.id });

    if (query.length === 0) {
      res.status(404).send(`Tags by ${req.params.id} id not found`);
      return;
    }

    res.status(200).send(query);
    return;
  },
);

// Создать новый тэг
router.post(
  '/tags',

  authMiddleware,

  tagBodyCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const [tag] = await knex<TagEntity>('tag').insert({ name: req.body.name, user_id: req.user.id }).returning('*');

    res.status(201).send(tag);
    return;
  },
);

// Обновить тэг
router.put(
  '/tags/:id',

  authMiddleware,

  taskTagParamIDCheck,
  tagBodyCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const [query] = await knex<TagEntity>('tag')
      .where({ id: req.params.id, user_id: req.user.id })
      // TODO: Не обновляем updated_at
      .update({ name: req.body.name })
      .returning('*');

    res.status(201).send(query);
    return;
  },
);

// Удалить тэг по ID
router.delete(
  '/tag/:id',

  authMiddleware,

  taskTagParamIDCheck,

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
      res.status(404).send('Tag not found');
      return;
    }

    res.status(200).send(query);
    return;
  },
);
