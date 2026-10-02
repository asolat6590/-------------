import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

// Контекст для авторизации
const AuthContext = createContext(null);

/**
 * Хук для использования контекста авторизации
 * @returns {Object} Объект с данными пользователя и методами авторизации
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Провайдер контекста авторизации
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // При монтировании проверяем наличие токена в localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        try {
          // Устанавливаем токен для API
          setToken(savedToken);
          
          // Получаем данные текущего пользователя
          const userData = await api.get('/auth/me', {}, savedToken);
          setUser(userData);
        } catch (err) {
          console.error('Ошибка при проверке авторизации:', err);
          // Если токен невалиден — удаляем его
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Регистрация нового пользователя
   * @param {Object} data - { email, password, name }
   */
  const register = async (data) => {
    try {
      const result = await api.post('/auth/register', data);
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', result.token);
      setToken(result.token);
      setUser(result.user);
      
      return result;
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      throw err;
    }
  };

  /**
   * Вход пользователя
   * @param {Object} data - { email, password }
   */
  const login = async (data) => {
    try {
      const result = await api.post('/auth/login', data);
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', result.token);
      setToken(result.token);
      setUser(result.user);
      
      return result;
    } catch (err) {
      console.error('Ошибка при входе:', err);
      throw err;
    }
  };

  /**
   * Выход пользователя
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};