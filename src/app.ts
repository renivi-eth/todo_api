import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { router } from './task/task.controller';
import { routerTags } from './tags/tags.controller';
import { authRouter } from './auth/auth.controller';

// Инициализация переменных окружения
dotenv.config();

const app = express();
const port = process.env.APP_PORT ?? 3000;

// Подключение к базе данных
// TODO: Убрать в отдельный файл. Заменить на PostgreSQL
mongoose
  .connect(`mongodb+srv:/@cluster0.uhacroy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
    dbName: 'todoDB',
  })
  .then(() => {
    console.log('Succesfull to connect Database');
  })
  .catch((error) => {
    console.log(error);
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
