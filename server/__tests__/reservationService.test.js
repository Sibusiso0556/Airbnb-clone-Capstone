jest.mock('../models/Listing');
jest.mock('../models/Reservation');

const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const reservationService = require('../services/reservationService');

describe('reservationService.create', () => {
  const baseListing = {
    _id: 'listing-1',
    pricePerNight: 100,
    cleaningFee: 20,
    guests: 4,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects a listing that does not exist', async () => {
    Listing.findById.mockResolvedValue(null);

    await expect(
      reservationService.create('guest-1', {
        listing: 'missing',
        checkIn: '2026-01-01',
        checkOut: '2026-01-03',
        guests: 2,
      })
    ).rejects.toThrow('That listing no longer exists.');
  });

  it('rejects checkOut before or equal to checkIn', async () => {
    Listing.findById.mockResolvedValue(baseListing);

    await expect(
      reservationService.create('guest-1', {
        listing: 'listing-1',
        checkIn: '2026-01-05',
        checkOut: '2026-01-05',
        guests: 2,
      })
    ).rejects.toThrow('Check-out must be after check-in.');
  });

  it('rejects a guest count over the listing capacity', async () => {
    Listing.findById.mockResolvedValue(baseListing);

    await expect(
      reservationService.create('guest-1', {
        listing: 'listing-1',
        checkIn: '2026-01-01',
        checkOut: '2026-01-03',
        guests: 10,
      })
    ).rejects.toThrow('This listing sleeps a maximum of 4 guests.');
  });

  it('rejects overlapping dates on the same listing', async () => {
    Listing.findById.mockResolvedValue(baseListing);
    Reservation.findOne.mockResolvedValue({ _id: 'existing-reservation' });

    await expect(
      reservationService.create('guest-1', {
        listing: 'listing-1',
        checkIn: '2026-01-01',
        checkOut: '2026-01-03',
        guests: 2,
      })
    ).rejects.toThrow('These dates are no longer available.');
  });

  it('calculates total price (nights * rate + cleaning fee + 12% service fee + 5% occupancy tax)', async () => {
    Listing.findById.mockResolvedValue(baseListing);
    Reservation.findOne.mockResolvedValue(null);
    Reservation.create.mockImplementation((data) => Promise.resolve({ _id: 'new-reservation', ...data }));

    const result = await reservationService.create('guest-1', {
      listing: 'listing-1',
      checkIn: '2026-01-01',
      checkOut: '2026-01-03',
      guests: 2,
    });

    expect(result.totalPrice).toBe(254);
    expect(Reservation.create).toHaveBeenCalledWith(
      expect.objectContaining({ guest: 'guest-1', listing: 'listing-1', totalPrice: 254 })
    );
  });

  it('applies a 5% weekly discount for stays of 7 nights or more', async () => {
    Listing.findById.mockResolvedValue(baseListing);
    Reservation.findOne.mockResolvedValue(null);
    Reservation.create.mockImplementation((data) => Promise.resolve({ _id: 'new-reservation', ...data }));

   
    const result = await reservationService.create('guest-1', {
      listing: 'listing-1',
      checkIn: '2026-01-01',
      checkOut: '2026-01-08',
      guests: 2,
    });

    expect(result.totalPrice).toBe(798);
    expect(Reservation.create).toHaveBeenCalledWith(
      expect.objectContaining({ guest: 'guest-1', listing: 'listing-1', totalPrice: 798 })
    );
  });
});

describe('reservationService.cancel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects canceling a reservation that belongs to neither the guest nor the listing host', async () => {
    Reservation.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'r1',
        guest: { toString: () => 'someone-else' },
        listing: { host: { toString: () => 'another-host' } },
      }),
    });

    await expect(reservationService.cancel('guest-1', 'r1')).rejects.toThrow(
      'You can only cancel reservations you made or that were made on your listings.'
    );
  });

  it('marks a reservation as canceled when owned by the requesting guest', async () => {
    const reservation = {
      _id: 'r1',
      guest: { toString: () => 'guest-1' },
      listing: { host: { toString: () => 'some-host' } },
      status: 'confirmed',
      save: jest.fn().mockResolvedValue(true),
    };
    Reservation.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(reservation) });

    const result = await reservationService.cancel('guest-1', 'r1');
    expect(result.status).toBe('canceled');
    expect(reservation.save).toHaveBeenCalled();
  });

  it('also allows the listing host to cancel a reservation made on their listing', async () => {
    const reservation = {
      _id: 'r1',
      guest: { toString: () => 'some-guest' },
      listing: { host: { toString: () => 'host-1' } },
      status: 'confirmed',
      save: jest.fn().mockResolvedValue(true),
    };
    Reservation.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(reservation) });

    const result = await reservationService.cancel('host-1', 'r1');
    expect(result.status).toBe('canceled');
  });
});
