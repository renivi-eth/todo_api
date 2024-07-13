import express, { Response } from 'express';
import { param } from 'express-validator';

import { db } from '../database';
import { TagEntity } from '../lib/types/tag.entity';
import { AppRequest } from '../lib/types/app-request';
import { IRelationsTaskTag } from '../lib/types/tast-tag.entity';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { handleReqQueryError } from '../lib/middleware/validate-query.middleware';

export const router = express.Router();

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

    const {
      rows: [checkTestTag],
    } = await db.query<IRelationsTaskTag>('SELECT * FROM task_tag WHERE task_id = $1 AND tag_id = $2', [
      req.params.taskId,
      req.params.tagId,
    ]);

    if (checkTestTag) {
      return res.status(400).send('Relations with task and tags already exist');
    }

    const {
      rows: [taskTag],
    } = await db.query<IRelationsTaskTag>('INSERT into task_tag(task_id, tag_id) VALUES ($1, $2) RETURNING *', [
      req.params.taskId,
      req.params.tagId,
    ]);

    return res.status(201).send(taskTag);
  },
);

router.get(
  '/tags/by-TaskId/:taskId',

  authMiddleware,

  param('taskId', 'ID must be UUID').trim().isUUID(),

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const {
      rows: [tag],
    } = await db.query<IRelationsTaskTag>(
      'SELECT name FROM task_tag JOIN tag on task_tag.tag_id = tag.id WHERE task_id = $1 AND user_id = $2',
      [req.params.taskId, req.user.id],
    );

    return res.status(200).send(tag);
  },
);

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

    const {
      rows: [tagTask],
    } = await db.query<IRelationsTaskTag>(
      'DELETE FROM task_tag WHERE task_id = $1 AND tag_id = $2 AND EXISTS (SELECT 1 FROM tag WHERE id = $2 AND user_id = $3) RETURNING *',
      [req.params.taskId, req.params.tagId, req.user.id],
    );

    if (!tagTask) {
      return res.status(404).send('Task-tag relationship not found');
    }

    const {
      rows: [tag],
    } = await db.query<TagEntity>('DELETE FROM tag WHERE id = $1 AND user_id = $2 RETURNING *', [
      req.params.tagId,
      req.user.id,
    ]);

    return res.status(200).send([tag.name, tagTask]);
  },
);

// если таска удалена, удаляем дальше сам тэг из таблица тэгов
