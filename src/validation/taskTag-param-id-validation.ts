import { param } from 'express-validator';
/*
naming - entityWhat_validate(param, body,query)Check
Проверка параметра ID в задаче
*/
export const taskTagParamIDCheck = param('id', 'ID must be UUID').trim().isUUID();
