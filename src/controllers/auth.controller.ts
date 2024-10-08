import { compare, hash } from 'bcrypt-ts';
import express, { Response } from 'express';

import { knex } from '../database';

import { AppRequest } from '../lib/types/app-request';
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

  async (req: AppRequest, res: Response) => {
    const { email, password }: Partial<UserEntity> = req.body;

    const [getUserByEmail] = await knex<UserEntity>('user').select('id').where({ email });

    if (getUserByEmail) {
      res.status(409).send(`User with ${email} E-mail already exist`);
      return;
    }

    const hashPassword = await hash(String(password), Number(process.env.PASSWORD_SALT));

    await knex<UserEntity>('user').insert({ email: email, password: hashPassword }).returning('*');

    res.status(201).send(`User with ${email} E-mail was create successful!`);
    return;
  },
);

// Аутентификация пользователя
router.post(
  '/auth/login',

  ...authBodyCheck,

  handleReqQueryError,

  async (req: AppRequest, res: Response) => {
    const { email, password }: Partial<UserEntity> = req.body;

    const checkUser = await knex<UserEntity>('user').select('*').where({ email }).first();

    if (!checkUser) {
      res.status(404).send(`User with ${email} not found!`);
      return;
    }

    const isValidPassword = await compare(String(password), checkUser.password);

    if (!isValidPassword) {
      res.status(400).send('Password is not correct');
      return;
    }

    const token = generateAccessToken(checkUser.id, checkUser.email);
    res.status(200).json({ token });
    return;
  },
);
