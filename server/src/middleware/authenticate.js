import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { createError } from './errorHandler.js';

/**
 * Middleware для проверки JWT-токена
 * Извлекает токен из заголовка Authorization, проверяет его и добавляет userId в req
 */
export const authenticate = (req, res, next) => {
  try {
    // Получаем заголовок Authorization
    const authHeader = req.headers.authorization;

    // Проверяем наличие заголовка
    if (!authHeader) {
      return next(createError('Токен авторизации не предоставлен', 401, 'NO_TOKEN'));
    }

    // Проверяем формат: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(createError('Неверный формат токена. Используйте: Bearer <token>', 401, 'INVALID_TOKEN_FORMAT'));
    }

    const token = parts[1];

    // Проверяем и декодируем токен
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(createError('Токен истёк. Пожалуйста, войдите снова.', 401, 'TOKEN_EXPIRED'));
      }
      if (error.name === 'JsonWebTokenError') {
        return next(createError('Невалидный токен', 401, 'INVALID_TOKEN'));
      }
      return next(createError('Ошибка проверки токена', 401, 'TOKEN_ERROR'));
    }

    // Добавляем userId в объект запроса для использования в контроллерах
    req.userId = decoded.id;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    next(error);
  }
};