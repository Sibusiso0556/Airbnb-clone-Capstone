import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as reservationService from '../services/reservationService';
import { useAuth } from '../hooks/useAuth';
import ReservationsTable from '../components/listing/ReservationsTable';
import './Trips.css';

export default function Trips() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    reservationService
      .getMyReservations()
      .then(setReservations)
      .catch((err) => setError(err.response?.data?.message || 'Could not load your trips.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Cancel this reservation?')) return;
    setDeletingId(id);
    try {
      await reservationService.cancelReservation(id);
      setReservations((current) => current.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this reservation.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container trips">
      <h1>My Reservations</h1>
      {loading && <p className="trips__status">Loading your trips…</p>}
      {error && <p className="trips__status trips__status--error">{error}</p>}
      {!loading && !error && reservations.length === 0 && (
        <div className="trips__empty">
          <p>No trips booked yet — when you book, they'll show up here.</p>
          <Link to="/" className="btn btn-primary">Start searching</Link>
        </div>
      )}
      {!loading && !error && reservations.length > 0 && (
        <ReservationsTable
          reservations={reservations}
          bookedByLabel={() => user?.name}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}
