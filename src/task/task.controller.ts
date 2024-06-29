import { TaskModel } from './task.model';
import express, { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

import db from '../db.postgres/index';

// types / interfaces / utilts
import { SortDirection } from '../lib/variables/sort-direction';
import { UserState } from '../lib/variables/user-state';
import { IPaginationOptions } from '../lib/types/pagination-options';
import { IFilters } from '../lib/types/filters';
import { completedCheck } from '../lib/utilts/check-completed';
import { IUserSort } from '../lib/types/user-sort';
import { ICreateTask } from '../lib/types/create-task';
import { authMiddleware } from '../middleware/auth.middleware';
import { IUserJWT } from '../lib/types/user-jwt';
import { PaginationDefaultValue } from '../lib/variables/pagination-default';

export const router = express.Router();

/**
 * Get all tasks or tasks with filters or sorts (GET method);
 */
router.get(
  '/api/v1/postgres/tasks',
  check('completed', 'completed must be boolean value').optional().trim().notEmpty().isBoolean(),
  check('sort', `sort must be string`).optional().trim().isString(),
  check('state', 'state must be backlog, in-progress or done')
    .optional()
    .trim()
    .notEmpty()
    .isString()
    .isIn(['backlog', 'in-progress', 'done']),
  check('page', 'page must be number').optional().trim(),
  check('limit', 'limit must be number').optional().trim().isNumeric(),
  // @ts-ignore
  authMiddleware,
  async (req: Request & { user: IUserJWT }, res: Response) => {
    
  }
);


router.get(
  '/api/tasks',
  check('completed', 'completed must be boolean value').optional().trim().notEmpty().isBoolean(),
  check('sort', `sort must be string`).optional().trim().isString(),
  check('state', 'state must be backlog, in-progress or done')
    .optional()
    .trim()
    .notEmpty()
    .isString()
    .isIn(['backlog', 'in-progress', 'done']),
  check('page', 'page must be number').optional().trim(),
  check('limit', 'limit must be number').optional().trim().isNumeric(),
  // @ts-ignore
  authMiddleware,
  async (req: Request & { user: IUserJWT }, res: Response) => {
    // Errors on validate query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Object for DB query - filters (completed, state), sorts, pagination
    const filters: IFilters = {};
    const sorts: Partial<IUserSort> = {};
    const pagination: IPaginationOptions = {
      page: Number(req.query.page) || PaginationDefaultValue.FIRSTPAGE,
      limit: Number(req.query.limit) || PaginationDefaultValue.LIMIT5,
      skip() {
        return (this.page - 1) * this.limit;
      },
    };

    // Check filters.completed
    const checkCompletedValue = completedCheck(String(req.query.completed));

    if (req.query.completed === undefined || (req.query.completed !== 'true' && req.query.completed !== 'false')) {
    } else {
      filters.completed = checkCompletedValue;
    }
    // Check filters.state
    switch (req.query.state) {
      case 'backlog':
        filters.state = UserState.BACKLOG;
        break;
      case 'in-progress':
        filters.state = UserState.IN_PROGRESS;
        break;
      case 'done':
        filters.state = UserState.DONE;
        break;
    }

    // Check sort
    switch (req.query.sort) {
      case 'created-at':
        sorts.createdAt = SortDirection.DESC;
        break;
      case 'title':
        sorts.title = SortDirection.ASC;
        break;
      default:
        sorts.title = SortDirection.ASC;
    }
    // GET ID from req.users
    const ownerID = req.user.id;

    // Get all task without query
    if (Object.keys(req.query).length === 0) {
      const allTasks = await TaskModel.find({ owner: ownerID }).catch((error) => {
        res.status(400).send(error);
        return null;
      });

      res.status(200).send(allTasks);
    } else {
      // Chain query to MongoDB
      const tasksWithParam = await TaskModel.find({ owner: ownerID })
        .find(filters)
        .sort(sorts)
        .skip(pagination.skip())
        .limit(pagination.limit)
        .select('')
        .catch((error) => {
          res.status(400).send(error);
          return null;
        });

      res.status(200).send(tasksWithParam);
    }
  },
);
/**
 * Create a new Task (POST method)
 */
router.post(
  '/api/task',
  check('title', 'Title is required or must be min 3 and max 300 symbols')
    .isString()
    .isLength({ min: 3, max: 300 })
    .notEmpty(),
  check('description', 'Field description must be a string and max 1000 symbols')
    .optional()
    .isLength({ min: 0, max: 1000 })
    .isString(),
  check('completed', 'Completed must be boolean value').optional().trim().notEmpty().isBoolean(),
  check('tags', 'Tags must be array').optional().isArray({ min: 0, max: 30 }),
  check('state', 'State must be only backlog, in-progress or done')
    .optional()
    .notEmpty()
    .isString()
    .isIn(['backlog', 'in-progress', 'done']),
  // @ts-ignore
  authMiddleware,
  async (req: Request<any, any, ICreateTask> & { user: IUserJWT }, res: Response) => {
    // Errors on validate body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, completed, tags, state } = req.body;

    // Do unique tags
    const UniqTags = Array.from(new Set(tags));

    // Create new Task
    const task = new TaskModel({
      title,
      description,
      completed,
      createdAt: Date.now(),
      tags: UniqTags,
      state,
      owner: req.user.id,
    });

    await task.save().catch((error) => res.status(400).send(error));

    res.status(201).send(task);
  },
);

/**
 * Get task by ID (GET method)
 */
router.get(
  '/api/tasks/:id',
  check('id', 'ID must be ObjectID (BSON)').trim().notEmpty().isMongoId(),
  // @ts-ignore
  authMiddleware,
  async (req: Request & { user: IUserJWT }, res: Response) => {
    // Errors on validate body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = req.params.id;
    const ownerID = req.user.id;

    // Get Task by ID
    // TODO: проверить что TaskModel.findOne вернет ошибку, если таски с таким ID не существует
    const taskById = await TaskModel.findOne({ owner: ownerID, _id: id }).catch((error) => {
      res.status(400).send(error);
      return null;
    });

    if (!taskById) {
      res.status(404).send('Not found');
    }

    res.status(200).send(taskById);
  },
);

/**
 * Update task by ID (PUT method)
 */
router.put(
  '/api/task/:id',
  check('id', 'ID must be ObjectID (BSON)').trim().notEmpty().isMongoId(),
  check('title', 'Title is required or must be min 3 and max 300 symbols')
    .isString()
    .isLength({ min: 3, max: 300 })
    .notEmpty(),
  check('description', 'Field description must be a string and max 1000 symbols')
    .optional()
    .isLength({ min: 0, max: 1000 })
    .isString(),
  check('completed', 'Completed must be boolean value').optional().trim().notEmpty().isBoolean(),
  check('tags', 'Tags must be array').optional().isArray({ min: 0, max: 30 }),
  check('state', 'State must be only backlog, in-progress or done')
    .optional()
    .notEmpty()
    .isString()
    .isIn(['backlog', 'in-progress', 'done']),
  // @ts-ignore
  authMiddleware,

  async (req: Request & { user: IUserJWT }, res: Response) => {
    // Errors on validate body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = req.params.id;
    const ownerID = req.user.id;

    const { title, description, completed, tags, state }: Partial<ICreateTask> = req.body;

    const ownerTask = await TaskModel.find({ _id: id, owner: ownerID });

    if (!ownerTask) {
      res.status(400).send('Tasks not found');
      return;
    }

    const updateTaskById = await TaskModel.findByIdAndUpdate(
      id,
      {
        title: title,
        description: description,
        completed: completed,
        updatedAt: Date.now(),
        tags: tags,
        state: state,
        owner: req.user.id,
      },
      { new: true },
    ).catch((error) => {
      res.status(400).send(error);
      return null;
    });

    res.status(201).send(updateTaskById);
  },
);

/**
 * Delete task by ID (DELETE method)
 */

router.delete(
  '/api/tasks/:id',
  check('id', 'ID must be ObjectID (BSON)').trim().notEmpty().isMongoId(),
  // @ts-ignore
  authMiddleware,
  async (req: Request & { user: IUserJWT }, res: Response) => {
    // Errors on validate body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id;
    const ownerID = req.user.id;

    const ownerTask = await TaskModel.find({ owner: ownerID });

    // Переписать:
    if (ownerTask) {
      const deleteTask = await TaskModel.findByIdAndDelete(id).catch((error) => res.status(500).send(error));
      res.status(200).send(`Task was delete successful ${deleteTask}`);
    } else {
      res.status(400).send('Task not found');
    }
  },
);

/**
 * Delete all tasks (DELETE method)
 * TODO:
 */
router.delete(
  '/api/task/deleteAll',
  // @ts-ignore
  authMiddleware,
  async (req: Request & { user: IUserJWT }, res: Response) => {
    // Errors on validate body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // only if roles === admin
  },
);

// router.get('/api/postgres/tasks', async (req: Request, res: Response) => {
//   const { name, description, state } = req.body;
//   const newTask = await db.query('SELECT * FROM TASKS');
//   res.json(newTask.rows[0]);
// });
