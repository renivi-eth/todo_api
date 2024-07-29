import express, { Response } from 'express';
import { param } from 'express-validator';

import { knex } from '../database';

import { authMiddleware } from '../lib/middleware/auth.middleware';
import { AppRequest } from '../lib/types/app-request';
import { TagEntity } from '../lib/types/tag.entity';
import { TaskTagEntity } from '../lib/types/task-tag.entity';
import { TaskEntity } from '../lib/types/task.entity';

import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { taskTagIdCheck } from '../validation/taskTagRelation-param-validation';

export const router = express.Router();

// Связать задачу с тэгом:
router.post(
  '/tags/:tagId/task/:taskId',

  authMiddleware,

  ...taskTagIdCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    // Проверка, что задача и тэг принадлежат юзеру (через user_id)
    const [checkTaskById] = await knex<TaskEntity>('task')
      .select('id')
      .where({ id: req.params.taskId, user_id: req.user.id })
      .returning('id');

    const [checkTagByID] = await knex<TagEntity>('tag')
      .select('id')
      .where({ id: req.params.tagId, user_id: req.user.id })
      .returning('id');

    if (!checkTaskById || !checkTagByID) {
      res.status(400).send('Task or Tag not found');
      return;
    }

    // Проверка наличия такой связи в БД
    const [checkRelations] = await knex<TaskTagEntity>('task_tag')
      .where({
        task_id: req.params.taskId,
        tag_id: req.params.tagId,
      })
      .returning('*');

    if (checkRelations) {
      res.status(400).send('Relation between Task and Tag already exist!');
      return;
    }

    // Если задача / тэг принадлежат пользователю И (!) такой связи еще нет, создаем связь
    const [createRelations] = await knex<TaskTagEntity>('task_tag')
      .insert({
        task_id: req.params.taskId,
        tag_id: req.params.tagId,
      })
      .returning('*');

    res.status(201).send(createRelations);
    return;
  },
);

// Получить тэги по задаче:
router.get(
  '/task/:taskId/tags',

  authMiddleware,

  param('taskId', 'taskId must be UUID').isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const allTagsQueryBuilder = await knex<TagEntity>('task_tag')
      .join('tag', 'task_tag.tag_id', '=', 'tag.id')
      .select('name')
      .where({ task_id: req.params.taskId, user_id: req.user.id });

    res.status(200).send(allTagsQueryBuilder);
    return;
  },
);

// Удалить связь задачи с тэгом:
router.delete(
  '/tags/:taskId/:tagId',

  authMiddleware,

  taskTagIdCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    // Проверка, что задача и тэг принадлежат юзеру (через user_id)
    const [checkTaskById] = await knex<TaskEntity>('task')
      .select('id')
      .where({ id: req.params.taskId, user_id: req.user.id })
      .returning('id');

    const [checkTagByID] = await knex<TagEntity>('tag')
      .select('id')
      .where({ id: req.params.tagId, user_id: req.user.id })
      .returning('id');

    if (!checkTaskById || !checkTagByID) {
      res.status(400).send('Task or Tag not found');
      return;
    }

    if (!checkTaskById || !checkTagByID) {
      res.status(400).send('Task or Tag not found');
      return;
    }

    const [deleteRelationsByID] = await knex<TaskTagEntity>('task_tag')
      .where({
        task_id: req.params.taskId,
        tag_id: req.params.tagId,
      })
      .del()
      .returning('*');

    if (!deleteRelationsByID) {
      res.status(400).send('Relation already delete!');
      return;
    }

    res.status(200).send(deleteRelationsByID);
    return;
  },
);
