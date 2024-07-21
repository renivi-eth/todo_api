import dotenv from 'dotenv';
import Knex from 'knex';

dotenv.config();

// Подключение к knex.js
export const knex = Knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
});

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
