import { body, ValidationChain } from 'express-validator';
/*
naming - entityWhat_validate(param, body,query)Check
Проверка тела запроса (body) - email, password при регистрации
*/
export const authBodyCheck: ValidationChain[] = [
  body('email', 'Email cannot be empty').isEmail(),
  body('password', 'Password must be more 4 symbols and not over 15 symbols').isLength({ min: 4, max: 15 }),
];
