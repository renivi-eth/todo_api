import { ParsedQs } from 'qs';
import { Request } from 'express';
import { IUserJWT } from './user-jwt';
import { TaskState } from '../variables/task-state';
import { SortDirection } from '../variables/sort-direction';

//TODO: подумай блять дважды!
import * as core from 'express-serve-static-core';

// TODO: на review Рустаму
/*
Объект Request наполняет запрос от пользователя. 
Имеет типизацию req: Request 

Request выглядит как generic,который принимает след типы: 
Request<Params = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs> - 
выше мы типизируем свойства объекта, ключи любые, свойства - типы который указаны 
Generic - это обобщенный тип, мы можем передать тип / интерфейс в этот generic и расширять объект запроса.

Нам необходимо расширить наш Request чтоб он понимал какие типы свойств будут у Query Param. 
Query param по дефолту имеет тип ParsedQS 
interface ParsedQs {
        [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[] | SortDirection;
    }
Который ключом принимает строку, значением - undefined, string, массив String, ParsedQS, массив ParsedQS (ParsedQS, массив ParsedQS - значения для ключа может быть другим объектом, т.е. мы может принимать объект или массив каких либо query param )

Поэтому мы делаем ExtendedParsedQs extends ParsedQs и расширяем типы, иными словами если придет query parameters limit - значение должно быть строкой и т.д,
Почему расширение типа не ругается, ведь мы передаем два тип enum, а interface ParsedQS не может принимать enum. Ответ: enum читаются как строки или числа 

*/

interface ExtendedParsedQs extends ParsedQs {
  limit?: string;
  state?: TaskState;
  sortProperty?: string;
  SortDirection?: SortDirection;
}

// Типизация для req.params.id
interface Params extends core.ParamsDictionary {
  id: string;
  taskId: string;
  tagId: string;
}

// Переопределяем тип Request
export type AppRequest = Request<Params, {}, {}, ExtendedParsedQs> & {
  user?: IUserJWT;
};
