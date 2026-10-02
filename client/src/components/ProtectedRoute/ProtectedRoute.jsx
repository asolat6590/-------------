import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Компонент для защиты маршрутов от неавторизованных пользователей
 * Если пользователь не залогинен — перенаправляет на /login
 * Если авторизация ещё проверяется — показывает индикатор загрузки
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Пока идёт проверка авторизации — показываем загрузку
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280',
      }}>
        Загрузка...
      </div>
    );
  }

  // Если пользователь не авторизован — редирект на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если авторизован — рендерим дочерние компоненты
  return children;
}

export default ProtectedRoute;