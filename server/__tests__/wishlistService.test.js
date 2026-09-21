jest.mock('../models/User');
jest.mock('../models/Listing');

const User = require('../models/User');
const Listing = require('../models/Listing');
const wishlistService = require('../services/wishlistService');

describe('wishlistService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('rejects saving a listing that does not exist', async () => {
      Listing.findById.mockResolvedValue(null);

      await expect(wishlistService.save('user-1', 'missing-listing')).rejects.toThrow('Listing not found.');
    });

    it('adds a listing id to savedListings once', async () => {
      Listing.findById.mockResolvedValue({ _id: 'listing-1' });
      const user = {
        savedListings: [],
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(user);

      await wishlistService.save('user-1', 'listing-1');

      expect(user.savedListings).toContain('listing-1');
      expect(user.save).toHaveBeenCalled();
    });

    it('does not duplicate a listing that is already saved', async () => {
      Listing.findById.mockResolvedValue({ _id: 'listing-1' });
      const user = {
        savedListings: [{ toString: () => 'listing-1' }],
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(user);

      await wishlistService.save('user-1', 'listing-1');

      expect(user.savedListings).toHaveLength(1);
      expect(user.save).not.toHaveBeenCalled();
    });
  });

  describe('unsave', () => {
    it('removes a listing id from savedListings', async () => {
      const user = {
        savedListings: [{ toString: () => 'listing-1' }, { toString: () => 'listing-2' }],
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(user);

      const result = await wishlistService.unsave('user-1', 'listing-1');

      expect(result).toHaveLength(1);
      expect(result[0].toString()).toBe('listing-2');
      expect(user.save).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('rejects when the user cannot be found', async () => {
      User.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await expect(wishlistService.list('missing-user')).rejects.toThrow('User not found.');
    });

    it('returns the populated saved listings', async () => {
      const savedListings = [{ _id: 'listing-1', title: 'Bordeaux Getaway' }];
      User.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue({ savedListings }) });

      const result = await wishlistService.list('user-1');
      expect(result).toEqual(savedListings);
    });
  });
});
