import express, { Response } from 'express';
import { body, param } from 'express-validator';

import { db } from '../database';
import { TagEntity } from '../lib/types/tag.entity';
import { AppRequest } from '../lib/types/app-request';
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

    const { taskId, tagId } = req.params;

    const {
      rows: [taskTag],
    } = await db.query('INSERT into task_tag VALUES task_id = $1, tag_id = $2 RETURNING *', [taskId, tagId]);

    return res.status(201).send(taskTag);
  },
);
