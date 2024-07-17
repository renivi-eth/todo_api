import { faker } from '@faker-js/faker';

export const getRandomEmail = (num: number): string[] => {
  const email: string[] = [];
  for (let i = 0; i <= num; i++) {
    email.push(faker.internet.email());
  }
  console.log(email);
  return email;
};
