import { compareSync, hashSync } from 'bcrypt-ts';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import db from '../lib/database';

import { generateAccessToken } from '../lib/utilts/generate-jwt-token';
import { validateQuery } from '../middleware/validatequery.middleware';
import { UserEntity } from '../lib/types/user.entity';
// Enviroment variables
dotenv.config();
// Router
export const authRouter = express.Router();

// Registration new user
authRouter.post(
  '/registration',

  body('email', 'Email cannot be empty').trim().isEmail(),
  body('password', 'Password must be more 4 symbols and not over 15 symbols').trim().isLength({ min: 4, max: 15 }),
  // Middleware for body Errors
  validateQuery,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const {
      rows: [user],
    } = await db.query<UserEntity>('SELECT id FROM "user" WHERE email = $1', [email]);

    if (user) {
      return res.status(409).send('User with it email already exist');
    }

    const hashPassword = hashSync(password, 7);

    await db.query<UserEntity>('INSERT INTO "user"(email, password) VALUES ($1,$2) RETURNING *', [email, hashPassword]);

    return res.status(201).send(`User with ${email} email was create successful`);
  },
);

// Auth user
authRouter.post(
  '/login',

  body('email', 'Email cannot be empty').trim().notEmpty().isString().isEmail(),
  body('password', 'Password must be not empty, min 5 and not over 30 symbols').trim().isLength({ min: 4, max: 15 }),
  // Middleware for body Errors
  validateQuery,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const {
      rows: [user],
    } = await db.query<UserEntity>('SELECT id, email, password FROM "user" WHERE email = $1', [email]);

    if (!user) {
      return res.status(409).send(`User with ${email} not found`);
    }

    const validPassword = compareSync(password, user.password);

    if (!validPassword) {
      return res.status(400).send('Password is not correct');
    }

    const token = generateAccessToken(user.id, user.email);
    return res.status(200).json({ token });
  },
);
