import jwt from 'jsonwebtoken';
import { registerUser, findUserByEmail, comparePassword, findUserById } from '../services/userService.js';
import { createError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';

/**
 * Генерация JWT-токена
 * @param {Object} user - Объект пользователя
 * @returns {string} JWT-токен
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Регистрация нового пользователя
 * POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Валидация обязательных полей
    if (!email || !password) {
      return next(createError('Email и пароль обязательны', 400, 'VALIDATION_ERROR'));
    }

    // Создаём пользователя
    const user = await registerUser({ email, password, name });

    // Генерируем токен
    const token = generateToken(user);

    res.status(201).json({
      data: {
        user,
        token,
      },
      message: 'Регистрация успешна',
    });
  } catch (error) {
    // Если email уже занят
    if (error.code === 'EMAIL_EXISTS') {
      return next(createError(error.message, 409, 'EMAIL_EXISTS'));
    }
    next(error);
  }
};

/**
 * Вход пользователя
 * POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Валидация обязательных полей
    if (!email || !password) {
      return next(createError('Email и пароль обязательны', 400, 'VALIDATION_ERROR'));
    }

    // Ищем пользователя по email
    const user = await findUserByEmail(email);
    if (!user) {
      return next(createError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS'));
    }

    // Проверяем пароль
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(createError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS'));
    }

    // Генерируем токен
    const token = generateToken(user);

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'Вход выполнен успешно',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение текущего пользователя (по токену)
 * GET /api/v1/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    // userId добавляется middleware authenticate
    const user = await findUserById(req.userId);
    
    if (!user) {
      return next(createError('Пользователь не найден', 404, 'NOT_FOUND'));
    }

    res.json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
};