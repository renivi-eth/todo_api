import dotenv from 'dotenv';
import pg from 'pg';
import Knex from 'knex';

dotenv.config();

// Подключение к knex.js
export const knex = Knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
});

// Создание экземпляра подключения к PostgreSQL
export const db = new pg.Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
});

knex
  .raw('SELECT NOW()')
  .then((res: string) => {
    console.log('PostgreSQL is running');
    return res;
  })
  .catch((err: Error) => {
    console.log('Error to connection PostgreSQL');
    return err;
  });
