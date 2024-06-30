import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

/** @function:
 * Создание JWT токена для доступа (полезная нагрузка + секрет + время жизни)
 */

const secretJWT = process.env.SECRET_JWT as string;
export const generateAccessToken = (id: string | number, email: string) => {
  const payload = {
    id,
    email,
  };
  return jwt.sign(payload, secretJWT, { expiresIn: '10h' });
};
