const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

async function signup({ name, username, password, role }) {
  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) {
    const error = new Error('That username is already taken.');
    error.statusCode = 409;
    throw error;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    username: username.toLowerCase(),
    password: hashed,
    role: role === 'host' ? 'host' : 'guest',
  });

  return { token: signToken(user), user: user.toSafeObject() };
}

async function login({ username, password }) {
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    const error = new Error('Invalid username or password.');
    error.statusCode = 401;
    throw error;
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    const error = new Error('Invalid username or password.');
    error.statusCode = 401;
    throw error;
  }

  return { token: signToken(user), user: user.toSafeObject() };
}

module.exports = { signup, login };
