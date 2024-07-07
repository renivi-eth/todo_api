import jwt from 'jsonwebtoken';

/**
 * Создание JWT токена для доступа (полезная нагрузка + секрет + время жизни)
 */
export const generateAccessToken = (id: string, email: string) => {
  const SECRET_JWT = process.env.SECRET_JWT as string;

  if (!SECRET_JWT) {
    throw new Error('Secret key for JWT not found');
  }

  return jwt.sign({ id, email }, SECRET_JWT, { expiresIn: '10h' });
};
