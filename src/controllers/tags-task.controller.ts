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

const handleTaskTagError = (err: any) => {
  console.error(err);
  return [null];
};

/**
 * Проверка, что параметр в пути является UUID
 */
const checkPathUUID = (field: string) => param(field, `${field} must be UUID`).isUUID();

// Связать задачу с тэгом:
router.post(
  '/tags/:tagId/task/:taskId',

  authMiddleware,

  checkPathUUID('tagId'),
  checkPathUUID('taskId'),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    // Проверка, что задача и тэг принадлежат юзеру (через user_id)
    const taskQuery = knex<TaskEntity>('task')
      .select('id')
      .where({ id: req.params.taskId, user_id: req.user.id })
      .returning('id');

    const tagQuery = knex<TagEntity>('tag')
      .select('id')
      .where({ id: req.params.tagId, user_id: req.user.id })
      .returning('id');

    const [checkTaskById, checkTagById] = await Promise.all([taskQuery, tagQuery]);

    if (!checkTaskById) {
      res.status(400).send('Task not found');
      return;
    }

    if (!checkTagById) {
      res.status(400).send('Tag not found');
      return;
    }

    // Проверка наличия такой связи в БД
    // const [checkRelations] = await knex<TaskTagEntity>('task_tag')
    //   .where({
    //     task_id: req.params.taskId,
    //     tag_id: req.params.tagId,
    //   })
    //   .returning('*')

    // if (checkRelations) {
    //   res.status(400).send('Relation between Task and Tag already exist!');
    //   return;
    // }

    // Если задача / тэг принадлежат пользователю И (!) такой связи еще нет, создаем связь
    const [createRelations] = await knex<TaskTagEntity>('task_tag')
      .insert({
        task_id: req.params.taskId,
        tag_id: req.params.tagId,
      })
      .returning('*')
      .catch(handleTaskTagError);

    if (!createRelations) {
      res.status(500).send('Something went wrong!');
    }

    res.status(201).send(createRelations);
    return;
  },
);

// Получить тэги по задаче:
router.get(
  '/task/:taskId/tags',

  authMiddleware,

  checkPathUUID('taskId'),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const allTagsQueryBuilder = await knex<TaskTagEntity>('task_tag')
      .join<TagEntity>('tag', 'task_tag.tag_id', '=', 'tag.id')
      .select('name')
      .where({ task_id: req.params.taskId, user_id: req.user.id });

    res.status(200).send(allTagsQueryBuilder);
    return;
  },
);

// Удалить связь задачи с тэгом:
router.delete(
  '/tags/:tagId/task/:taskId',

  authMiddleware,

  checkPathUUID('tagId'),
  checkPathUUID('taskId'),

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
      res.status(404).send('Task or Tag not found');
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
      res.status(404).send('Relation not found!');
      return;
    }

    res.status(200).send(deleteRelationsByID);
    return;
  },
);
