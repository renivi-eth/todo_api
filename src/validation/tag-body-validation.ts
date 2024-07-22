import { body } from 'express-validator';

/*
naming - entityWhat_validate(param, body,query)Check
Проверка тела запроса (body) у тега 
*/
export const tagBodyCheck = body('name', 'Tag is required or must be min 3 and max 50 symbols')
  .isString()
  .isLength({ min: 3, max: 50 });
