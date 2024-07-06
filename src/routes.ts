import { router } from './task/task.controller';
import { routerTags } from './tags/tags.controller';
import { authRouter } from './auth/auth.controller';
import { Router } from 'express';

const allRoutes = Router();

allRoutes.use('/api/v1/', router);
allRoutes.use('/api/v1/', routerTags);
allRoutes.use('/api/v1/auth', authRouter);

export default allRoutes;
