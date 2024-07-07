import dotenv from 'dotenv';

import { router as taskRouter } from './controllers/task.controller';
import { router as tagRouter } from './controllers/tags.controller';
import { router as authRouter } from './controllers/auth.controller';

// Загрузка переменных окружения
dotenv.config();

const API_VERSION = '/api/v1/';
const port = process.env.APP_PORT || 3030;

const app = express();

// Парсинг JSON в теле запроса. Должен быть выше роутеров
app.use(express.json());

// Роутеры
app.use(API_VERSION, taskRouter);
app.use(API_VERSION, tagRouter);
app.use(API_VERSION, authRouter);

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
