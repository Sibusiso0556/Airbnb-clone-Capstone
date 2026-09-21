import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../components/listing/ListingCard';
import * as wishlistService from '../services/wishlistService';
import { useWishlist } from '../hooks/useWishlist';
import './SearchResults.css';

export default function Wishlist() {
  const { savedIds } = useWishlist();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    wishlistService
      .getWishlist()
      .then(setListings)
      .catch((err) => setError(err.response?.data?.message || 'Could not load your wishlist.'))
      .finally(() => setLoading(false));
    // Re-fetch whenever the saved-id set changes size, so unsaving here updates the grid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIds.size]);

  return (
    <div className="container search-results">
      <h1 className="search-results__heading">Wishlists</h1>

      {loading && <p className="search-results__status">Loading your saved stays…</p>}
      {error && <p className="search-results__status search-results__status--error">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <div className="search-results__empty">
          <p className="search-results__status">You haven't saved any stays yet.</p>
          <Link to="/" className="btn btn-primary">Start exploring</Link>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="homepage__grid">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
