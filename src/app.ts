import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { router } from './task/task.controller';
import { routerTags } from './tags/tags.controller';
import { authRouter } from './auth/auth.controller';
import db from './lib/db/db';

// Инициализация переменных окружения
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

// Подключение к PostgresSQL
db.query('SELECT NOW()')
  .then(() => {
    console.log('Соединение с PostgreSQL успешно установлено');
  })
  .catch((err) => {
    console.error('Ошибка при подключении к PostgreSQL:', err);
  });

// Парсинг JSON в теле запроса. Должен быть выше роутеров
app.use(express.json());

// Роутеры
app.use(router);
app.use(routerTags);
app.use(authRouter);

// Обработка ошибок
app.use((req, res) => {
  res.status(404).send('Not found');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
