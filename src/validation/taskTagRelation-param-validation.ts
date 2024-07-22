import { param } from 'express-validator';
/*
naming - entityWhat_validate(param, body,query)Check
Проверка параметров taskId, tagID в testTag связи
*/
export const taskTagIdCheck = [
  param('taskId', 'ID must be UUID').trim().isUUID(),
  param('tagId', 'ID must be UUID').trim().isUUID(),
];
