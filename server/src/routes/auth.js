import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Регистрация нового пользователя
 * Body: { email, password, name? }
 */
router.post('/register', register);

/**
 * POST /api/v1/auth/login
 * Вход пользователя
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * GET /api/v1/auth/me
 * Получение данных текущего пользователя (требует токен)
 * Header: Authorization: Bearer <token>
 */
router.get('/me', authenticate, getMe);

export default router;