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

    const tagsQueryBuilder = knex<TagEntity>('tag').where({ user_id: req.user.id }).returning('*');

    if (req.query.limit) {
      tagsQueryBuilder.limit(Number(req.query.limit));
    }

    if (req.query.sortDirection && req.query.sortProperty) {
      tagsQueryBuilder.orderBy(String(req.query.sortProperty), String(req.query.sortDirection));
    }

    const tags = await tagsQueryBuilder;

    res.status(200).send(tags);
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

    const [tagQueryBuilderById] = await knex<TagEntity>('tag').where({ id: req.params.id, user_id: req.user.id });

    if (!tagQueryBuilderById) {
      res.status(404).send(`Tags by ${req.params.id} id not found`);
      return;
    }

    res.status(200).send(tagQueryBuilderById);
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
    const { name }: Partial<TagEntity> = req.body;

    const [tagQueryBuilderCreate] = await knex<TagEntity>('tag')
      .insert({ name: name, user_id: req.user.id })
      .returning('*');

    res.status(201).send(tagQueryBuilderCreate);
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

    const { name }: Partial<TagEntity> = req.body;

    const [tagQueryBuilderUpdate] = await knex<TagEntity>('tag')
      .where({ id: req.params.id, user_id: req.user.id })
      .update({ name: name, updated_at: knex.fn.now() })
      .returning('*');

    res.status(201).send(tagQueryBuilderUpdate);
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

    const [tagQueryBuilderDelete] = await knex<TagEntity>('tag')
      .where({ id: req.params.id, user_id: req.user.id })
      .del()
      .returning('*');

    if (!tagQueryBuilderDelete) {
      res.status(404).send('Tag not found');
      return;
    }

    res.status(200).send(tagQueryBuilderDelete);
    return;
  },
);
