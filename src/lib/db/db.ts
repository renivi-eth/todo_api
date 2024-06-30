import pg from 'pg';
import dotenv from 'dotenv';

const { Pool, Client } = pg;
dotenv.config();

const db = new Pool({
  user: 'admin',
  password: 'cXdlcnR5MTIzNDU=',
  host: 'localhost',
  port: 5432,
  database: 'todo',
});

export default db;
