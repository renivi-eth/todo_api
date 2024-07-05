import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { IUserJWT } from '../lib/types/user-jwt';
import { removeDublicate } from '../lib/utilts/remove-dublicate';
import { authMiddleware } from '../middleware/auth.middleware';

export const routerTags = express.Router();

