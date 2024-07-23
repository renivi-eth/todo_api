import { compare, hash } from 'bcrypt-ts';
import express, { Request, Response } from 'express';

import { knex } from '../database';
import { UserEntity } from '../lib/types/user.entity';
import { authBodyCheck } from '../validation/auth-body-validation';
import { generateAccessToken } from '../lib/utilts/generate-jwt-token';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';

export const router = express.Router();

// Регистрация пользователя
router.post(
  '/auth/registration',

  ...authBodyCheck,

  handleReqQueryError,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const [getUserByEmail] = await knex('user').select('id').where({ email: email });

    if (getUserByEmail) {
      res.status(409).send(`User with ${email} E-mail already exist`);
      return;
    }

    const hashPassword = await hash(password, Number(process.env.PASSWORD_SALT));

    await knex('user').insert({ email: email, password: hashPassword }).returning('*');

    return res.status(201).send(`User with ${email} email was create successful!`);
  },
);

// Аутентификация пользователя
router.post(
  '/auth/login',

  ...authBodyCheck,

  handleReqQueryError,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // TODO: Указывать явно .select('*');
    const user = await knex<UserEntity>('user').where({ email }).first();

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
