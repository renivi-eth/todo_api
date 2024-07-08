# Node.js REST API для приложения TODO

## Инициализация:

```bash
# Клонирование репозитория:
git clone git@github.com:renivi-eth/todo_api.git

cd todo_api

# Установка зависимостей:
npm ci

# Инициализация базы данных:
docker-compose up -d

# Запуск сервера:
npm run dev
```

## План работ:

1. Разобрать и понять структуру клиентского приложения
1. Понять какие нужны API поинты для работы приложения
1. Спроектировать базу данных. Разработать схему. Продумать связи
1. Расписать план работы с сущностями через API.
   - Каждый path в API должен быть описан
   - Какие методы будут использоваться
   - Какие данные будут передаваться
   - Какие данные будут возвращаться
   - Как будут обрабатываться ошибки
   - Какие данные будут валидироваться

## Правила:

1. Каждая строчка кода должна осмысленна
1. Разделяем импорты, библиотеки отдельно от нашей логики
1. Только именованные импорты
1. Переменные где лежит булевое значение называть с префиксом `is`
1. По возможности всегда использовать const, а не let, и никогда var
