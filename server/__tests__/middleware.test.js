jest.mock('../models/User');

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAuth', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects a request with no Authorization header', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an invalid/expired token', async () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches req.user and calls next for a valid token', async () => {
    const token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET);
    User.findById.mockResolvedValue({ _id: 'user-1', role: 'guest' });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(req.user).toEqual({ _id: 'user-1', role: 'guest' });
    expect(next).toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('blocks a user whose role does not match', () => {
    const req = { user: { role: 'guest' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('host')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a user whose role matches', () => {
    const req = { user: { role: 'host' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('host')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
