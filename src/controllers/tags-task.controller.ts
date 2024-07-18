import express, { Response } from 'express';
import { param } from 'express-validator';

import { db } from '../database';
import { knex } from '../database';
import { TagEntity } from '../lib/types/tag.entity';
import { AppRequest } from '../lib/types/app-request';
import { IRelationsTaskTag } from '../lib/types/tast-tag.entity';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';

export const router = express.Router();

// Связать задачу с тэгом:
// TODO: добавить проверки существования задачи и тега в таблицах - task, tag, иначе запрос будет падать
router.post(
  '/tags/to-task/:taskId/:tagId',

  authMiddleware,

  param('taskId', 'ID must be UUID').trim().isUUID(),
  param('tagId', 'ID must be UUID').trim().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const checkRelations = await knex<IRelationsTaskTag>('task_tag').where({
      task_id: req.params.taskId,
      tag_id: req.params.tagId,
    });
    console.log(checkRelations.length);

    if (checkRelations.length > 0) {
      return res.status(400).send('Relations with task and tags already exist');
    }

    const taskTagRelations = await knex<IRelationsTaskTag>('task_tag')
      .insert({ task_id: req.params.taskId, tag_id: req.params.tagId })
      .returning('*');

    return res.status(201).send(taskTagRelations);
  },
);

// Получить тэги по задаче:
router.get(
  '/tags/by-TaskId/:taskId',

  authMiddleware,

  param('taskId', 'ID must be UUID').trim().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const [query] = await knex<Pick<TagEntity, 'name'>>('task_tag')
      .join('tag', 'tag_id', '=', 'tag.id')
      .where({ task_id: req.params.taskId, user_id: req.user.id })
      .select('name');

    return res.status(200).send(query);
  },
);

// Удалить связь задачи с тэгом + удалить сам тэг:
router.delete(
  '/tags/:taskId/:tagId',

  authMiddleware,

  param('taskId', 'ID must be UUID').trim().isUUID(),
  param('tagId', 'ID must be UUID').trim().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const [query] = await knex('task_tag')
      .where({ task_id: req.params.taskId, tag_id: req.params.tagId })
      .del()
      .returning('*');

    if (!query) {
      return res.status(404).send('Task-tag relationship not found');
    }

    return res.status(200).send(query);
  },
);
