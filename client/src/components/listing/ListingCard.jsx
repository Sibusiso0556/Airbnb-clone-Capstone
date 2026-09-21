import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import './ListingCard.css';

export default function ListingCard({ listing, linkTo, showSave = true }) {
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(listing._id);
  const href = linkTo || `/listing/${listing._id}`;

  return (
    <div className="listing-card">
      <div className="listing-card__image-wrap">
        <img src={listing.image} alt={listing.title} className="listing-card__image" />
        {showSave && (
          <button
            className="listing-card__save"
            aria-label={saved ? 'Remove from saved' : 'Save listing'}
            onClick={(e) => {
              e.preventDefault();
              if (!isAuthenticated) return;
              toggleSave(listing._id);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'var(--color-brand)' : 'rgba(0,0,0,0.5)'}>
              <path
                d="M12 21s-7.5-4.6-10-9.3C.6 8.1 2.3 4 6.2 4c2.1 0 3.7 1.2 5.8 3.7C14.1 5.2 15.7 4 17.8 4c3.9 0 5.6 4.1 4.2 7.7C19.5 16.4 12 21 12 21z"
                stroke="white"
                strokeWidth="1.2"
              />
            </svg>
          </button>
        )}
      </div>
      <Link to={href} className="listing-card__body">
        <p className="listing-card__type">{listing.type || 'Entire home'}</p>
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__location">{listing.city}</p>
        <p className="listing-card__meta">
          {listing.guests} guests - {listing.type || 'Entire home'} - {listing.bedrooms ?? 1} bedrooms - {listing.baths ?? 1} bathrooms
        </p>
        {listing.amenities?.length > 0 && (
          <p className="listing-card__meta">{listing.amenities.slice(0, 3).join(' - ')}</p>
        )}
        <p className="listing-card__rating-row">
          ★ {listing.rating?.toFixed(1) ?? '5.0'} ({listing.reviewCount ?? 0} reviews)
        </p>
        <p className="listing-card__price">
          {formatCurrency(listing.pricePerNight)} <span>/ night</span>
        </p>
      </Link>
    </div>
  );
}
