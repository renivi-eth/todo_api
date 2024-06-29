import { RoleModel } from '../auth/role.model';
import { UserModel } from '../auth/user.model';
import { authMiddleware } from '../middleware/auth.middleware';
import express, { Request, Response } from 'express';
import { hashSync, compareSync } from 'bcrypt-ts';
import { check, validationResult } from 'express-validator';
import dotenv from 'dotenv';

// types / interfaces / utilts
import { generateAccessToken } from '../lib/utilts/generate-jwt-token';
import { IUserJWT } from '../lib/types/user-jwt';

// PostgresSQL client
import db from '../db.postgres/index';
// .env
dotenv.config();
// Express router for all app
export const authRouter = express.Router();

authRouter.post(
  '/api/v1/postgres/registration',
  check('email', 'E-mail cannot be empty and must be as string').trim().notEmpty().isString(),
  check('password', 'Password must be more 4 symbols and not over 15 symbols').trim().isLength({ min: 4, max: 15 }),
  async (req: Request, res: Response) => {
    // Check error on validate query
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Error on reg' });
    }

    const { email, password } = req.body;

    const queryCheck = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    };

    const checkUsers = await db.query(queryCheck.text, queryCheck.values);

    if (checkUsers.rows.length > 0) {
      res.json('Email already exist');
    }

    const hashPassword = hashSync(password, 7);

    const queryNewUser = {
      text: 'INSERT INTO users (email, password, updated_at, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      values: [email, hashPassword],
    };

    const newUser = await db.query(queryNewUser.text, queryNewUser.values);
    res.status(200).send('User was create successful');
  },
);

/**
 * Регистрация пользователя
 */
authRouter.post(
  '/api/auth/registration',
  check('username', 'username cannot be empty ').trim().notEmpty().isString(),
  check('password', 'Password must be more 4 symbols and not over 15 symbols').trim().isLength({ min: 4, max: 15 }),
  async (req: Request, res: Response) => {
    // Errors on validate query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: `Error on registration` });
    }

    const { username, password } = req.body;

    const isUser = await UserModel.findOne({ username })
      .then((user) => Boolean(user))
      .catch((error) => {
        res.status(400).send(error);
        return null;
      });

    if (isUser) {
      return res.status(400).json({ message: 'Username already exist' });
    }

    const UserRole = await RoleModel.findOne({ value: 'user' });

    const hashPassword = hashSync(password, 7);
    const user = new UserModel({ username, password: hashPassword, roles: [UserRole?.value] });

    await user.save().catch((error) => {
      res.status(400).send(error);
      return null;
    });

    return res.status(201).json({ message: 'User was create succesfull' });
  },
);

/**
 * Аутентификация пользователя
 */

authRouter.post(
  '/api/auth/login',
  check('username', 'Username must be not empty, more 5 and not over 30 symbols')
    .notEmpty()
    .isLength({ min: 1, max: 30 })
    .trim(),
  check('password', 'Password must be not empty, min 5 and not over 30 symbols').notEmpty(),
  async (req: Request, res: Response) => {
    // Errors on validate query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await UserModel.findOne({ username }).catch((error) => {
      res.status(500).send(error);
      return null;
    });

    if (!user) {
      return res.status(400).json(`User with ${username} not found`);
    }

    const validPassword = compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json(`Password is not correct`);
    }

    const token = generateAccessToken(user._id, user.roles);
    res.status(201).json({ token });
  },
);

/**
 * Получение всех пользователей, только после регистрации, с промежуточным обработчиком, который отдает нам всех пользователей (СДЕЛАН ДЛЯ ПРИМЕРА)
 */

// @ts-ignore
authRouter.get('/api/auth/users', authMiddleware, async (req: Request & { user: IUserJWT }, res: Response) => {
  const users = await UserModel.find({}).catch((error) => res.status(500).send(error));
  console.log(users);
  console.log(req.user);
  if (!req.user.role.includes('user')) {
    return res.status(403).send('Access denied');
  }
  res.status(200).send(users);
});
