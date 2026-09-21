import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as listingService from '../services/listingService';
import { useAuth } from '../hooks/useAuth';
import HostListingRow from '../components/host/HostListingRow';
import './HostDashboard.css';

export default function HostDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadListings = useCallback(() => {
    setLoading(true);
    listingService
      .getMyListings()
      .then(setListings)
      .catch((err) => setError(err.response?.data?.message || 'Could not load your listings.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await listingService.deleteListing(id);
      setListings((current) => current.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this listing.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container host-dashboard">
      <div className="host-dashboard__topbar">
        <Link to="/" className="host-dashboard__logo">
          <img src="/branding/logo-icon-red.png" alt="" width="20" height="20" />
          airbnb
        </Link>
        <span className="host-dashboard__user">Welcome, {user?.name}</span>
      </div>

      <nav className="host-dashboard__nav">
        <Link to="/host/reservations" className="btn btn-outline">View Reservations</Link>
        <span className="btn btn-outline host-dashboard__nav--active">View Listings</span>
        <Link to="/host/listings/new" className="btn btn-outline">Create Listing</Link>
      </nav>

      <h2>My Hotel List</h2>

      {loading && <p className="host-dashboard__status">Loading your listings…</p>}
      {error && <p className="host-dashboard__status host-dashboard__status--error">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <div className="host-dashboard__empty">
          <p>You haven't listed a place yet.</p>
          <Link to="/host/listings/new" className="btn btn-primary">Create your first listing</Link>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div className="host-dashboard__list">
          {listings.map((listing) => (
            <HostListingRow
              key={listing._id}
              listing={listing}
              onDelete={handleDelete}
              deleting={deletingId === listing._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
