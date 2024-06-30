import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new pg.Pool({
  user: 'admin',
  password: 'cXdlcnR5MTIzNDU=',
  host: 'localhost',
  port: 5432,
  database: 'todo',
});

export default db;
