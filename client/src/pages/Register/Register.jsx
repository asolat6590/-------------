import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Если пользователь уже авторизован — редирект на главную
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!email || !password) {
      setError('Email и пароль обязательны');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({ name, email, password });
      // После успешной регистрации useEffect сделает редирект
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Ошибка при регистрации:', err);

      // Определяем тип ошибки
      if (err.code === 'EMAIL_EXISTS') {
        setError('Пользователь с таким email уже существует');
      } else if (err.code === 'VALIDATION_ERROR') {
        setError(err.message || 'Проверьте введённые данные');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Не удалось подключиться к серверу');
      } else {
        setError(err.message || 'Произошла ошибка при регистрации');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт для управления финансами</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Имя</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя (необязательно)"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email *</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Пароль *</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Подтвердите пароль *</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Создать аккаунт'}
          </button>
        </form>

        <div className={styles.footer}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;