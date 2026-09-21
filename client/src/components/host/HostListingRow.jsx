import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import './HostListingRow.css';

export default function HostListingRow({ listing, onDelete, deleting }) {
  return (
    <div className="host-row">
      <div className="host-row__media">
        <img src={listing.image} alt={listing.title} className="host-row__image" />
        <div className="host-row__actions">
          <Link to={`/host/listings/${listing._id}/edit`} className="btn btn-indigo">Update</Link>
          <button className="btn btn-danger" onClick={() => onDelete(listing._id)} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
      <div className="host-row__body">
        <p className="host-row__location">{listing.type || 'Entire home'} - {listing.city}</p>
        <h3 className="host-row__title">{listing.title}</h3>
        <p className="host-row__meta">
          {listing.guests} guests - {listing.type || 'Entire home'} - {listing.bedrooms ?? 1} bedrooms - {listing.baths ?? 1} bathrooms
        </p>
        {listing.amenities?.length > 0 && (
          <p className="host-row__meta">Amenities: {listing.amenities.join(', ')}</p>
        )}
        <p className="host-row__rating">★ {listing.rating?.toFixed(1) ?? '5.0'} ({listing.reviewCount ?? 0} reviews)</p>
        <p className="host-row__price">{formatCurrency(listing.pricePerNight)}/night</p>
      </div>
    </div>
  );
}
