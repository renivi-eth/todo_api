import { param } from 'express-validator';
/**
 * Проверка, что параметр в пути является UUID
 */
export const checkPathUUID = (field: string) => param(field, `${field} must be UUID`).isUUID();
