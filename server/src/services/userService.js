import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/connection.js';

/**
 * Регистрация нового пользователя
 * @param {Object} data - Данные пользователя
 * @param {string} data.email - Email (уникальный)
 * @param {string} data.password - Пароль (будет захеширован)
 * @param {string} data.name - Имя пользователя
 * @returns {Promise<Object>} Созданный пользователь (без пароля)
 * @throws {Error} Если email уже занят
 */
export const registerUser = async (data) => {
  const db = getDb();
  const { email, password, name } = data;

  // Проверяем, не занят ли email
  const existingUser = db.data.users.find((u) => u.email === email);
  if (existingUser) {
    const error = new Error('Пользователь с таким email уже существует');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  // Хешируем пароль (10 раундов — хороший баланс безопасности и скорости)
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: crypto.randomUUID(),
    email,
    password: hashedPassword,
    name: name || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.data.users.push(newUser);
  await db.write();

  // Возвращаем пользователя без пароля
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Поиск пользователя по email
 * @param {string} email - Email пользователя
 * @returns {Promise<Object|null>} Найденный пользователь (с паролем, для проверки) или null
 */
export const findUserByEmail = async (email) => {
  const db = getDb();
  return db.data.users.find((u) => u.email === email) || null;
};

/**
 * Поиск пользователя по ID
 * @param {string} id - ID пользователя
 * @returns {Promise<Object|null>} Найденный пользователь (без пароля) или null
 */
export const findUserById = async (id) => {
  const db = getDb();
  const user = db.data.users.find((u) => u.id === id);
  if (!user) return null;

  // Возвращаем без пароля
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Проверка пароля пользователя
 * @param {string} plainPassword - Пароль в открытом виде (от клиента)
 * @param {string} hashedPassword - Хешированный пароль из БД
 * @returns {Promise<boolean>} true, если пароль верный
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};