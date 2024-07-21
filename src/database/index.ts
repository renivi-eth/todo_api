import dotenv from 'dotenv';
import Knex from 'knex';

dotenv.config();

// Создание экземпляра подключения к PostgreSQL с помощью knex.js
export const knex = Knex({
  client: 'pg',

  connection: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    port: Number(process.env.POSTGRES_PORT),
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },

  // TODO: Что это, разобраться
  searchPath: ['knex', 'public'],
});

// TODO: Вернуть как было. Зачем нужен return, что будет лежать в res, в catch, нужно console.error
knex
  .raw('SELECT NOW()')
  .then((res: string) => {
    console.log('PostgreSQL is running (on knex.js)');
    return res;
  })
  .catch((err: Error) => {
    console.log('Error to connection PostgreSQL');
    return err;
  });
