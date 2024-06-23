import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { router } from './task/task.controller';
import dotenv from 'dotenv';
import { routerTags } from './tags/tags.controller';
import { authRouter } from './auth/auth.controller';

dotenv.config();

const username = encodeURIComponent(process.env.USERNAME_MONGODB as string);
const password = encodeURIComponent(process.env.PASSWORD_MONGODB as string);

const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@cluster0.uhacroy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    {
      dbName: 'todoDB',
    },
  )
  .then(() => {
    console.log('Succesfull to connect Database');
  })
  .catch((error) => {
    console.log(error);
  });

app.use(express.json());

app.use(router);
app.use(routerTags);
app.use(authRouter);

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
