import { CommandFailedEvent, ObjectId } from 'mongodb';
import { TaskModel, ITask } from '../task/task.model';
import express, { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { body, check, validationResult } from 'express-validator';
import { removeDublicate } from '../lib/utilts/remove-dublicate';
import { authMiddleware } from '../middleware/auth.middleware';
import { IUserJWT } from '../lib/types/user-jwt';

export const routerTags = express.Router();

/**
 * Get Tags by ID
 */
routerTags.get(
  '/api/task/tags/:id',
  check('id', 'ID must be ObjectID (BSON)').trim().notEmpty().isMongoId(),
  async (req: Request, res: Response) => {
    // Errors on validate body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id;

    const taskById = await TaskModel.findById(id);
    res.status(200).send(taskById?.tags);
  },
);

/**
 * Create new Tags by Task ID (POST method)
 */
routerTags.post(
  '/api/task/:id/tags',
  check('id', 'ID must be ObjectID (BSON)').trim().notEmpty().isMongoId(),
  check('tags', 'Tags must be an array with string values or not empty').notEmpty().isArray({ min: 1, max: 30 }),
  // @ts-ignore
  authMiddleware,
  async (req: Request & { user: IUserJWT }, res: Response) => {
    // Errors on validate body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const taskID = req.params.id;
    const tags: string[] = req.body;
    const ownerID = req.user.id;

    const ownerTask = await TaskModel.find({ owner: ownerID });

    if (!ownerTask) {
      res.status(400).send('Task created by this owner not found');
      return
    }

    const task = await TaskModel.findById(taskID).catch((error) => {
      res.status(400).send(error);
      return null;
    });

    if (!task) {
       res.status(404).send('Task not found');
       return
    }

    const currentTags: string[] = task.tags || [];
    const allTags = removeDublicate(tags, currentTags);

    if (allTags.length !== (currentTags.length + tags.length)) {
       res.status(400).send('Task has dublicated tags');
       return
    }

    task.tags = allTags;

    await task.save();
    
    res.status(200).send('Task was create successfully');
  },
);

/**
 * Удаление TAGS по ID
 */
routerTags.delete(
  '/api/task/:task_id/tag',
  check('task_id', 'task_id must be ObjectID (BSON)').trim().notEmpty().isMongoId(),
  check('tagNames', 'tagNames must be Array').notEmpty().isArray({ min: 1, max: 30 }),
  async (req: Request, res: Response) => {
    // Errors on validate body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskId = req.params.task_id;

  
    const task = await TaskModel.findById(taskId);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return 
    }
    // Update task tags to empty array
    task.tags = task.tags?.filter((tag) => !req.params.tagNames.includes(tag))

    await task.save();

    return res.status(200).json({ message: 'Tags deleted successfully' });
  },
);
