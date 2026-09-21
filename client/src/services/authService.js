import api from './api';

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
}

export async function signup(payload) {
  const { data } = await api.post('/auth/signup', payload);
  return data;
}

export function persistSession(token, user) {
  localStorage.setItem('airbnb_token', token);
  localStorage.setItem('airbnb_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('airbnb_token');
  localStorage.removeItem('airbnb_user');
}

export function getStoredUser() {
  const token = localStorage.getItem('airbnb_token');
  const raw = localStorage.getItem('airbnb_user');

  // A user object with no token (or vice versa) is a stale/inconsistent
  // session — e.g. left over from before the database was reseeded, or a
  // token that was cleared without the cached user being cleared too.
  // Treat it as logged out rather than letting the UI think it's authenticated.
  if (!token || !raw) {
    if (raw) localStorage.removeItem('airbnb_user');
    if (token) localStorage.removeItem('airbnb_token');
    return null;
  }

  return JSON.parse(raw);
}

export function getStoredToken() {
  return localStorage.getItem('airbnb_token');
}
