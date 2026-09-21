const authService = require('../services/authService');

async function signup(req, res, next) {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username, and password are required.' });
    }
    const result = await authService.signup({ name, username, password, role });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const result = await authService.login({ username, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
