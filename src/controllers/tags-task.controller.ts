import { param } from 'express-validator';
import express, { Response } from 'express';

import { knex } from '../database';

import { TagEntity } from '../lib/types/tag.entity';
import { AppRequest } from '../lib/types/app-request';
import { TaskTagEntity } from '../lib/types/task-tag.entity';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { taskTagIdCheck } from '../validation/taskTagRelation-param-validation';
import { taskTagParamIDCheck } from '../validation/taskTag-param-id-validation';

export const router = express.Router();

// Связать задачу с тэгом:
// TODO: добавить проверки существования задачи и тега в таблицах - task, tag, иначе запрос будет падать
// TODO: проверка ручки удаления (on delete cascade)
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

    // TODO: Пользователь должен создавать связи только со своими сущностями

    const checkRelations = await knex<TaskTagEntity>('task_tag').where({
      task_id: req.params.taskId,
      tag_id: req.params.tagId,
    });

    if (checkRelations.length) {
      res.status(400).send('Relations with task and tags already exist');
      return;
    }

    const taskTagRelations = await knex<TaskTagEntity>('task_tag')
      .insert({ task_id: req.params.taskId, tag_id: req.params.tagId })
      .returning('*');

    res.status(201).send(taskTagRelations);
    return;
  },
);

// Получить тэги по задаче:
router.get(
  // TODO: нейминг path
  '/tags/by-TaskId/:taskId',

  authMiddleware,

  taskTagParamIDCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    // TODO: Разобраться в возвращаемых значениях, это одна или много сущностей

    const [query] = await knex<Pick<TagEntity, 'name'>>('task_tag')
      .join('tag', 'task_tag.tag_id', '=', 'tag.id')
      .where({ task_id: req.params.taskId, user_id: req.user.id })
      .select('name');

    res.status(200).send(query);
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

    // TODO: Пользователь может удалять только свои связи

    const [query] = await knex<TaskTagEntity>('task_tag')
      .where({ task_id: req.params.taskId, tag_id: req.params.tagId })
      .del()
      .returning('*');

    if (!query) {
      res.status(404).send('Task-tag relationship not found');
      return;
    }

    res.status(200).send(query);
    return;
  },
);
