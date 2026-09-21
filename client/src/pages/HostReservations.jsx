import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as reservationService from '../services/reservationService';
import ReservationsTable from '../components/listing/ReservationsTable';
import './Trips.css';

export default function HostReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    reservationService
      .getHostReservations()
      .then(setReservations)
      .catch((err) => setError(err.response?.data?.message || 'Could not load reservations.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this reservation?')) return;
    setDeletingId(id);
    try {
      await reservationService.cancelReservation(id);
      setReservations((current) => current.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this reservation.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container trips">
      <div className="host-dashboard__nav">
        <span className="btn btn-outline host-dashboard__nav--active">View Reservations</span>
        <Link to="/host" className="btn btn-outline">View Listings</Link>
        <Link to="/host/listings/new" className="btn btn-outline">Create Listing</Link>
      </div>
      <h1>My Reservations</h1>
      {loading && <p className="trips__status">Loading reservations…</p>}
      {error && <p className="trips__status trips__status--error">{error}</p>}
      {!loading && !error && reservations.length === 0 && (
        <p className="trips__status">No reservations yet.</p>
      )}
      {!loading && !error && reservations.length > 0 && (
        <ReservationsTable
          reservations={reservations}
          bookedByLabel={(res) => res.guest?.name}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}
