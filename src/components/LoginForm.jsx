import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!email || email.trim() === '') {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Formato de correo electrónico no válido';
      }
    }

    if (!password || password.trim() === '') {
      newErrors.password = 'La contraseña es obligatoria';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = login(email, password);
      if (res instanceof Promise) {
        res.catch((err) => {
          setErrors({ general: err.message });
        });
      }
    } catch (err) {
      setErrors({ general: err.message });
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <h2>Iniciar sesión</h2>

        {errors.general && (
          <div className="error-container error-message general-error">
            {errors.general}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email-input">Correo electrónico</label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => {
               setEmail(e.target.value);
               if (errors.email) {
                 setErrors(prev => ({ ...prev, email: '' }));
               }
            }}
            placeholder="email@example.com"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password-input">Contraseña</label>
          <input
            id="password-input"
            type="password"
            value={password}
            onChange={(e) => {
               setPassword(e.target.value);
               if (errors.password) {
                 setErrors(prev => ({ ...prev, password: '' }));
               }
            }}
            placeholder="••••••••"
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button type="submit" className="login-btn">
          Acceder
        </button>
      </form>
    </div>
  );
}
