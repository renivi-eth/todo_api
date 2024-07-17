import { compare, hash } from 'bcrypt-ts';
import express, { Request, Response } from 'express';

import { db } from '../database';
import { knex } from '../database';
import { UserEntity } from '../lib/types/user.entity';
import { emailPassCheck } from '../lib/variables/validation';
import { generateAccessToken } from '../lib/utilts/generate-jwt-token';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { spawn } from 'child_process';
import { PostgresError } from '../lib/types/pg-error';

export const router = express.Router();

// Регистрация пользователя
router.post(
  '/auth/registration',

  ...emailPassCheck,

  handleReqQueryError,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const hashPassword = await hash(password, Number(process.env.PASSWORD_SALT));

    try {
      await knex('user').insert({ email: email, password: hashPassword });

      return res.status(201).send(`User with ${email} email was create successful!`);
    } catch (error) {
      const postgresErr = error as PostgresError;

      if (postgresErr.code === '23505') {
        return res.status(400).send(`User with ${email} email already exist`);
      }
    }
  },
);

// Аутентификация пользователя
router.post(
  '/auth/login',

  ...emailPassCheck,

  handleReqQueryError,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // const {
    //   rows: [user],
    // } = await db.query<UserEntity>('SELECT * FROM "user" WHERE email = $1', [email]);

    const [user] = await knex('user').where({ email: email });

    if (!user) {
      return res.status(404).send(`User with ${email} not found`);
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).send('Password is not correct');
    }

    const token = generateAccessToken(user.id, user.email);
    return res.status(200).json({ token });
  },
);
