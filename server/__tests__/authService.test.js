jest.mock('../models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authService = require('../services/authService');

describe('authService', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('rejects a username that is already taken', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing-user' });

      await expect(
        authService.signup({ name: 'Sibu', username: 'sibu', password: 'password123', role: 'guest' })
      ).rejects.toThrow('That username is already taken.');
    });

    it('creates a guest by default and returns a signed token', async () => {
      User.findOne.mockResolvedValue(null);
      const created = {
        _id: 'new-user-id',
        toSafeObject: () => ({ _id: 'new-user-id', name: 'Sibu', username: 'sibu', role: 'guest' }),
      };
      User.create.mockResolvedValue(created);

      const result = await authService.signup({ name: 'Sibu', username: 'Sibu', password: 'password123' });

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'sibu', role: 'guest' })
      );
      expect(result.user.role).toBe('guest');
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
      expect(decoded.sub).toBe('new-user-id');
    });

    it('honors an explicit host role', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'host-id',
        toSafeObject: () => ({ _id: 'host-id', name: 'Ghazal', username: 'ghazal', role: 'host' }),
      });

      const result = await authService.signup({
        name: 'Ghazal',
        username: 'ghazal',
        password: 'password123',
        role: 'host',
      });

      expect(result.user.role).toBe('host');
    });
  });

  describe('login', () => {
    it('rejects an unknown username', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.login({ username: 'nobody', password: 'x' })).rejects.toThrow(
        'Invalid username or password.'
      );
    });

    it('rejects an incorrect password', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      User.findOne.mockResolvedValue({ _id: 'id', username: 'sibu', password: hashed, role: 'guest' });

      await expect(authService.login({ username: 'sibu', password: 'wrong-password' })).rejects.toThrow(
        'Invalid username or password.'
      );
    });

    it('logs in successfully with correct credentials', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      User.findOne.mockResolvedValue({
        _id: 'id',
        username: 'sibu',
        password: hashed,
        role: 'guest',
        toSafeObject: () => ({ _id: 'id', name: 'Sibu', username: 'sibu', role: 'guest' }),
      });

      const result = await authService.login({ username: 'sibu', password: 'correct-password' });
      expect(result.user.username).toBe('sibu');
      expect(typeof result.token).toBe('string');
    });
  });
});
