import dotenv from 'dotenv';
import express from 'express';
import db from './lib/database';
import allRoutes from './routes';

// Enviroment var's
dotenv.config();

const app = express();
const port = process.env.APP_PORT || 3030;

// Подключение к PostgresSQL
db.query('SELECT NOW()')
  .then(() => {
    console.log('Connection with Postgres successful');
  })
  .catch((err) => {
    console.error('Error with connection PostgreSQL:', err);
  });

// Парсинг JSON в теле запроса. Должен быть выше роутеров
app.use(express.json());

// Роутеры
app.use(allRoutes);

// Обработка ошибок
app.use((req, res) => {
  res.status(404).send('Path not found');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
