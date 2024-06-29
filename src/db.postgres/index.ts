import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  user: 'postgres', //encodeURIComponent(process.env.USERNAME_POSTGRESQL as string),
  password: '570984', //encodeURIComponent(process.env.PASS_POSTGRESQL as string),
  host: encodeURIComponent(process.env.HOST_POSTGRESQL as string),
  port: parseInt(process.env.PORT_POSTGRESQL as string, 10),
  database: encodeURIComponent(process.env.DB_NAME_POSTGRESQL as string),
});

export default pool;
