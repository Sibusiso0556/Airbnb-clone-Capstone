import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency, nightsBetween } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import * as reservationService from '../../services/reservationService';
import './BookingCard.css';

export default function BookingCard({ listing, checkIn, checkOut, onDatesChange }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = nights * listing.pricePerNight;
  const cleaningFee = listing.cleaningFee ?? 0;
  const weeklyDiscount = nights >= 7 ? Math.round(subtotal * 0.05) : 0;
  const serviceFee = Math.round((subtotal - weeklyDiscount) * 0.12);
  const occupancyTaxes = Math.round((subtotal - weeklyDiscount) * 0.05);
  const total = subtotal - weeklyDiscount + cleaningFee + serviceFee + occupancyTaxes;

  async function handleReserve(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      // eslint-disable-next-line no-alert
      alert('Please log in to make a reservation.');
      navigate('/login', { state: { from: routerLocation } });
      return;
    }
    if (!checkIn || !checkOut || nights <= 0) {
      setError('Choose valid check-in and check-out dates.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await reservationService.createReservation({
        listing: listing._id,
        checkIn,
        checkOut,
        guests,
      });
      // eslint-disable-next-line no-alert
      alert('Reservation successful!');
      navigate('/trips');
    } catch (err) {
      if (err.response?.status === 401) {
        // eslint-disable-next-line no-alert
        alert('Your session has expired. Please log in again to complete this reservation.');
        navigate('/login', { state: { from: routerLocation } });
        return;
      }
      setError(err.response?.data?.message || 'Could not complete your reservation.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="booking-card" onSubmit={handleReserve}>
      <div className="booking-card__price-row">
        <span>
          <strong>{formatCurrency(listing.pricePerNight)}</strong> / night
        </span>
        <span className="booking-card__rating">★ {listing.rating?.toFixed(1) ?? '5.0'} · {listing.reviewCount ?? 0} reviews</span>
      </div>

      <div className="booking-card__dates">
        <label>
          <span>CHECK-IN</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onDatesChange(e.target.value, checkOut)}
            required
          />
        </label>
        <label>
          <span>CHECKOUT</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => onDatesChange(checkIn, e.target.value)}
            required
          />
        </label>
      </div>
      <label className="booking-card__guests">
        <span>GUESTS</span>
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
          {Array.from({ length: listing.guests || 4 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} guest{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </label>

      <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
        {submitting ? 'Reserving…' : 'Reserve'}
      </button>

      <p className="booking-card__note">You won't be charged yet</p>
      {error && <p className="booking-card__error">{error}</p>}

      {nights > 0 && (
        <div className="booking-card__breakdown">
          <div>
            <span>{formatCurrency(listing.pricePerNight)} × {nights} nights</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {weeklyDiscount > 0 && (
            <div className="booking-card__discount">
              <span>Weekly discount</span>
              <span>-{formatCurrency(weeklyDiscount)}</span>
            </div>
          )}
          {cleaningFee > 0 && (
            <div>
              <span>Cleaning fee</span>
              <span>{formatCurrency(cleaningFee)}</span>
            </div>
          )}
          <div>
            <span>Service fee</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <div>
            <span>Occupancy taxes and fees</span>
            <span>{formatCurrency(occupancyTaxes)}</span>
          </div>
          <div className="booking-card__total">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </form>
  );
}
