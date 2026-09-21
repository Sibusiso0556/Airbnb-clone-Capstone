import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthForm.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(username, password);
      const redirectTo = location.state?.from?.pathname || (user.role === 'host' ? '/host' : '/');
      navigate(redirectTo, { replace: true });
    } catch {
      // error is surfaced via context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-page__logo">airbnb</Link>
      <div className="auth-page__content">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <Link to="/forgot-password" className="auth-form__forgot">Forgot Password ?</Link>
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="btn btn-indigo auth-form__submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="auth-page__footer">
          New to Airbnb? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
