import { body, ValidationChain } from 'express-validator';

export const emailPassCheck: ValidationChain[] = [
  body('email', 'Email cannot be empty').trim().isEmail(),
  body('password', 'Password must be more 4 symbols and not over 15 symbols').trim().isLength({ min: 4, max: 15 }),
];
