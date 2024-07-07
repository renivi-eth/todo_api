import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const db = new pg.Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: 'todo',
});

// Подключение к PostgresSQL
db.query('SELECT NOW()')
  .then(() => {
    console.log('Connection with Postgres successful');
  })
  .catch((err) => {
    console.error('Error with connection PostgreSQL:', err);
  });
