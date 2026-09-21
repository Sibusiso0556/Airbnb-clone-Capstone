import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthForm.css';

export default function Signup() {
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'guest' });
  const [submitting, setSubmitting] = useState(false);
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await signup(form);
      navigate(user.role === 'host' ? '/host' : '/', { replace: true });
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-page__logo">airbnb</Link>
      <div className="auth-page__content">
        <h1>Sign up</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Full name</span>
            <input type="text" value={form.name} onChange={update('name')} required />
          </label>
          <label>
            <span>Username</span>
            <input type="text" value={form.username} onChange={update('username')} autoComplete="username" required />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          <fieldset className="auth-form__role">
            <legend>I want to</legend>
            <label className="auth-form__role-option">
              <input type="radio" name="role" value="guest" checked={form.role === 'guest'} onChange={update('role')} />
              Book stays as a guest
            </label>
            <label className="auth-form__role-option">
              <input type="radio" name="role" value="host" checked={form.role === 'host'} onChange={update('role')} />
              Host my own listings
            </label>
          </fieldset>
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="btn btn-indigo auth-form__submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="auth-page__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
