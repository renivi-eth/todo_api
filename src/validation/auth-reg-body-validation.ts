import { body, ValidationChain } from 'express-validator';

export const emailPassCheck: ValidationChain[] = [
  body('email', 'Email cannot be empty').isEmail(),
  body('password', 'Password must be more 4 symbols and not over 15 symbols').isLength({ min: 4, max: 15 }),
];
