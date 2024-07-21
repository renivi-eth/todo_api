import { faker } from '@faker-js/faker';
import { knex } from '../database';
import { hash } from 'bcrypt-ts';

import { UserEntity } from '../lib/types/user.entity';
import { TaskEntity } from '../lib/types/task.entity';
import { TaskState } from '../lib/variables/task-state';

const createUser = async function createUser() {
  const users: Partial<UserEntity>[] = [];

  // Генерация 500 пользователей
  for (let i = 0; i < 500; i++) {
    users.push({
      email: faker.internet.email(),
      password: await hash(process.env.DEFAULT_PASSWORD as string, Number(process.env.PASSWORD_SALT)),
    });
  }

  await knex('user').insert(users);
  console.log('500 Users was created!');
};

// createUser();

const createTask = async function createTask() {
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

createTask();
