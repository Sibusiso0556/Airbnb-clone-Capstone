jest.mock('../models/Listing');
jest.mock('../models/Reservation');

const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const listingService = require('../services/listingService');

describe('listingService.update / remove — ownership checks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects updating a listing owned by another host', async () => {
    Listing.findById.mockResolvedValue({ host: { toString: () => 'other-host' } });

    await expect(listingService.update('host-1', 'listing-1', { title: 'New title' })).rejects.toThrow(
      'You do not own this listing.'
    );
  });

  it('allows updating a listing owned by the requesting host', async () => {
    const listing = {
      host: { toString: () => 'host-1' },
      title: 'Old title',
      save: jest.fn().mockResolvedValue(true),
    };
    Listing.findById.mockResolvedValue(listing);

    const result = await listingService.update('host-1', 'listing-1', { title: 'New title' });
    expect(result.title).toBe('New title');
    expect(listing.save).toHaveBeenCalled();
  });

  it('rejects deleting a listing that does not exist', async () => {
    Listing.findById.mockResolvedValue(null);

    await expect(listingService.remove('host-1', 'missing')).rejects.toThrow('Listing not found.');
  });

  it('rejects deleting a listing owned by another host', async () => {
    Listing.findById.mockResolvedValue({ host: { toString: () => 'other-host' }, deleteOne: jest.fn() });

    await expect(listingService.remove('host-1', 'listing-1')).rejects.toThrow('You do not own this listing.');
  });
});

describe('listingService.search', () => {
  function mockChain(results) {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(results),
    };
    return chain;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('applies a case-insensitive location filter across city/country/title', async () => {
    const chain = mockChain([]);
    Listing.find.mockReturnValue(chain);
    Listing.countDocuments.mockResolvedValue(0);

    await listingService.search({ location: 'Bordeaux' });

    const query = Listing.find.mock.calls[0][0];
    expect(query.$or).toEqual([
      { city: new RegExp('Bordeaux', 'i') },
      { country: new RegExp('Bordeaux', 'i') },
      { title: new RegExp('Bordeaux', 'i') },
    ]);
  });

  it('excludes listings with an overlapping confirmed reservation when dates are given', async () => {
    Reservation.find.mockReturnValue({ select: jest.fn().mockResolvedValue([{ listing: 'booked-listing' }]) });
    const chain = mockChain([]);
    Listing.find.mockReturnValue(chain);
    Listing.countDocuments.mockResolvedValue(0);

    await listingService.search({ checkIn: '2026-01-01', checkOut: '2026-01-03' });

    const query = Listing.find.mock.calls[0][0];
    expect(query._id).toEqual({ $nin: ['booked-listing'] });
  });

  it('returns pagination metadata based on total count and limit', async () => {
    const chain = mockChain([{ _id: '1' }, { _id: '2' }]);
    Listing.find.mockReturnValue(chain);
    Listing.countDocuments.mockResolvedValue(25);

    const { pagination } = await listingService.search({ page: 2, limit: 10 });

    expect(pagination).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3 });
    expect(chain.skip).toHaveBeenCalledWith(10);
    expect(chain.limit).toHaveBeenCalledWith(10);
  });
});
