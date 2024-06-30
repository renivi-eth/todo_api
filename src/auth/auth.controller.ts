import { compareSync, hashSync } from 'bcrypt-ts';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import db from '../lib/db/db';

// types / interfaces / utilts
import { generateAccessToken } from '../lib/utilts/generate-jwt-token';

// Инициализация переменных окружения
dotenv.config();
// Роутер
export const authRouter = express.Router();

// Reg new user
authRouter.post(
  '/api/v1/auth/postgres/registration',
  check('email', 'Email cannot be empty').trim().notEmpty().isString().isEmail(),
  check('password', 'Password must be more 4 symbols and not over 15 symbols').trim().isLength({ min: 4, max: 15 }),
  async (req: Request, res: Response) => {
    // Errors on validate query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: `Error on registration` });
    }

    const { email, password } = req.body;

    const queryCheckUser = {
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    };

    const userCheck = await db.query(queryCheckUser);

    if (userCheck.rows.length > 0) {
      return res.status(409).send('User with it email already exist');
    }

    const hashPassword = hashSync(password, 7);

    const queryNewUser = {
      text: 'INSERT INTO users(email, password) VALUES ($1,$2) RETURNING *',
      values: [email, hashPassword],
    };

    const newUser = await db.query(queryNewUser);
    return res.status(201).send(`User with ${email} was create successful`);
  },
);

// Auth user
authRouter.post(
  '/api/v1/auth/postgres/login',
  check('email', 'Email cannot be empty').trim().notEmpty().isString().isEmail(),
  check('password', 'Password must be not empty, min 5 and not over 30 symbols').notEmpty(),
  async (req: Request, res: Response) => {
    // Errors on validate query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const queryFindUser = {
      text: 'SELECT (id, email, password) FROM users WHERE email = $1',
      values: [email],
    };

    const findUser = await db.query(queryFindUser);
    if (findUser.rows.length === 0) {
      return res.status(409).send('User with it email not found');
    }
    console.log(findUser);
    const infoUsers = findUser.rows[0].row.replace(/^\(|\)$/g, '').split(',');

    const userID = infoUsers[0];
    const userEmail = infoUsers[1];

    const validPassword = compareSync(password, infoUsers[2]);
    if (!validPassword) {
      return res.status(400).send('Password is nor correct');
    }

    const token = generateAccessToken(userID, userEmail);
    return res.status(200).json({ token });
  },
);
