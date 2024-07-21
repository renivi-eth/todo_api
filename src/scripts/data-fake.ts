import { hash } from 'bcrypt-ts';
import { knex } from '../database';
import { faker } from '@faker-js/faker';

// TODO: Удалить весь Fake Data модуль

import { TagEntity } from '../lib/types/tag.entity';
import { UserEntity } from '../lib/types/user.entity';
import { TaskEntity } from '../lib/types/task.entity';
import { TaskState } from '../lib/variables/task-state';

// ГЕНЕРАЦИЯ ЮЗЕРА
const createUser = async function () {
  const users: Partial<UserEntity>[] = [];

  for (let i = 0; i < 500; i++) {
    users.push({
      email: faker.internet.email(),
      password: await hash(process.env.DEFAULT_PASSWORD as string, Number(process.env.PASSWORD_SALT)),
    });
  }

  await knex('user').insert(users);
  console.log('500 Users was created!');
};

// TODO: в отдельную функцию все - genereteData();
// createUser();

// ГЕНЕРАЦИЯ ЗАДАЧИ
const createTask = async function () {
  const users = await knex<Pick<TaskEntity, 'id'>>('user').select('id');
  const task: Partial<TaskEntity>[] = [];
  for (let i = 0; i < 200; i++) {
    const getRandomUser: { id: string } = users[Math.floor(Math.random() * users.length)];
    task.push({
      name: faker.lorem.words(3).slice(0, 30),
      description: faker.lorem.sentences(1),
      state: ['backlog', 'in-progress', 'done'][Math.floor(Math.random() * 3)] as TaskState,
      user_id: getRandomUser.id as string,
    });
  }
  await knex('task').insert(task);
  console.log('200 task was created');
};

// TODO: в отдельную функцию все - genereteData();
// createTask();

const createTags = async function () {
  const users = await knex('user').select('id');
  const tags: Partial<TagEntity>[] = [];

  for (let i = 0; i < 200; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    tags.push({
      name: faker.lorem.word(),
      user_id: user.id,
    });
  }
  await knex('tag').insert(tags);
  console.log('Tags was create');
};

// TODO: в отдельную функцию все - genereteData();
// createTags();

const createTaskTagRelation = async function () {
  const tasks = await knex<Pick<TaskEntity, 'id'>>('task').select('id');
  const tags = await knex<Pick<TagEntity, 'id'>>('tag').select('id');

  const taskTags: { task_id: string; tag_id: string }[] = [];
  // Генерация 300 связей
  for (let i = 0; i < 300; i++) {
    const taskId = tasks[Math.floor(Math.random() * tasks.length)];
    const tagId = tags[Math.floor(Math.random() * tags.length)];

    const exists = await knex('task_tag').where({ task_id: taskId.id, tag_id: tagId.id }).first();

    if (!exists) {
      taskTags.push({
        task_id: taskId.id,
        tag_id: tagId.id,
      });
    }
  }

  await knex('task_tag').insert(taskTags);
  console.log('Task-Tag was created!');
};

// TODO: в отдельную функцию все - genereteData();
// createTaskTagRelation();
