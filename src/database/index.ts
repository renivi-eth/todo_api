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
});

/*
Подключение к Базе Данных через Knex.js 
При успешном завершении Promise log успешное подключение, при ошибки - log код ошибки (err.code)
*/
knex
  .raw('SELECT NOW()')
  .then(() => {
    console.log('Connection with Postgres successful');
  })
  .catch((err) => {
    console.error('Error with connection PostgreSQL:', err.code);
  });
