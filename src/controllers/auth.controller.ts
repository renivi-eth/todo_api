import { body } from 'express-validator';
import { compare, hash } from 'bcrypt-ts';
import express, { Request, Response } from 'express';

import { db } from '../database';
import { UserEntity } from '../lib/types/user.entity';
import { handleReqQueryError } from '../lib/middleware/handle-err.middleware';
import { generateAccessToken } from '../lib/utilts/generate-jwt-token';

export const router = express.Router();

const PASSWORD_SALT = 7;

const emailCheck = body('email', 'Email cannot be empty').trim().isEmail();
const passwordCheck = body('password', 'Password must be more 4 symbols and not over 15 symbols')
  .trim()
  .isLength({ min: 4, max: 15 });

// Registration user
router.post(
  '/auth/registration',

  emailCheck,
  passwordCheck,

  handleReqQueryError,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const {
      rows: [user],
    } = await db.query<Pick<UserEntity, 'id'>>('SELECT id FROM "user" WHERE email = $1', [email]);

    if (user) {
      return res.status(409).send('User with it email already exist');
    }

    const hashPassword = await hash(password, PASSWORD_SALT);

    await db.query('INSERT INTO "user"(email, password) VALUES ($1,$2)', [email, hashPassword]);

    return res.status(201).send(`User with ${email} email was create successful!`);
  },
);

// Login user
router.post(
  '/auth/login',

  emailCheck,
  passwordCheck,

  handleReqQueryError,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const {
      rows: [user],
    } = await db.query<UserEntity>('SELECT * FROM "user" WHERE email = $1', [email]);

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
