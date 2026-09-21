import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as listingService from '../services/listingService';
import BookingCard from '../components/listing/BookingCard';
import RatingBar from '../components/listing/RatingBar';
import ReviewComment from '../components/listing/ReviewComment';
import DateRangeCalendar from '../components/listing/DateRangeCalendar';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { nightsBetween } from '../utils/format';
import './ListingDetail.css';

const COUNTRY_INFO = {
  USA: {
    continent: 'North America',
    cities: ['Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Boston', 'Seattle', 'Austin', 'Denver'],
  },
  France: {
    continent: 'Europe',
    cities: ['Nice', 'Lyon', 'Marseille', 'Lille', 'Aix-en-Provence', 'Rouen', 'Amiens', 'Toulouse'],
  },
  Japan: {
    continent: 'Asia',
    cities: ['Kyoto', 'Osaka', 'Yokohama', 'Sapporo', 'Nagoya', 'Fukuoka', 'Kobe', 'Nara'],
  },
  'South Africa': {
    continent: 'Africa',
    cities: ['Johannesburg', 'Durban', 'Pretoria', 'Stellenbosch', 'Port Elizabeth', 'Knysna', 'Hermanus', 'Franschhoek'],
  },
  Thailand: {
    continent: 'Asia',
    cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Koh Samui', 'Krabi', 'Pattaya', 'Ayutthaya', 'Hua Hin'],
  },
};

const UNIQUE_STAYS = [
  'Beach House Rentals',
  'Camper Rentals',
  'Glamping Rentals',
  'Treehouse Rentals',
  'Cabin Rentals',
  'Tiny House Rentals',
  'Lakehouse Rentals',
  'Mountain Chalet Rentals',
];

export default function ListingDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleSave } = useWishlist();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    listingService
      .getListingById(id)
      .then((data) => {
        if (active) setListing(data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Could not load this listing.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="container listing-detail__status">Loading listing…</p>;
  if (error) return <p className="container listing-detail__status listing-detail__status--error">{error}</p>;
  if (!listing) return null;

  const amenities = listing.amenities || [];
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 8);
  const categories = listing.ratingBreakdown || {
    Cleanliness: listing.rating,
    Accuracy: listing.rating,
    Communication: listing.rating,
    Location: listing.rating,
    'Check-in': listing.rating,
    Value: listing.rating,
  };
  const countryInfo = COUNTRY_INFO[listing.country];
  const bedroomPhoto = listing.images?.[1] || listing.image;

  return (
    <div className="container listing-detail">
      <div className="listing-detail__header">
        <div className="listing-detail__header-row">
          <h1>{listing.title}</h1>
          <div className="listing-detail__header-actions">
            <button
              type="button"
              className="listing-detail__action"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: listing.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
            >
              ⇪ Share
            </button>
            {isAuthenticated && (
              <button
                type="button"
                className="listing-detail__action"
                onClick={() => toggleSave(listing._id)}
              >
                {isSaved(listing._id) ? '♥ Saved' : '♡ Save'}
              </button>
            )}
          </div>
        </div>
        <div className="listing-detail__header-meta">
          <span>★ {listing.rating?.toFixed(1) ?? '5.0'} · {listing.reviewCount ?? 0} reviews</span>
          <span>· {listing.superhost ? 'Superhost' : 'Verified'}</span>
          <span>· {listing.city}, {listing.country}</span>
        </div>
      </div>

      <div className="listing-detail__gallery">
        {(listing.images || [listing.image]).slice(0, 5).map((src, i) => (
          <img key={src + i} src={src} alt={`${listing.title} photo ${i + 1}`} className={`gallery-img gallery-img--${i}`} />
        ))}
      </div>

      <div className="listing-detail__body">
        <div className="listing-detail__main">
          <section className="listing-detail__section">
            <h2>{listing.type || 'Entire home'} hosted by {listing.hostName || 'the host'}</h2>
            <p className="listing-detail__submeta">
              {listing.guests} guests · {listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''} · {listing.beds} bed{listing.beds > 1 ? 's' : ''} · {listing.baths} bath{listing.baths > 1 ? 's' : ''}
            </p>
          </section>

          <section className="listing-detail__section listing-detail__highlights">
            <div className="listing-detail__highlight">
              <span className="listing-detail__highlight-icon">🏠</span>
              <div>
                <p className="listing-detail__highlight-title">{listing.type || 'Entire home'}</p>
                <p className="listing-detail__submeta">You'll have the {listing.type?.toLowerCase().includes('room') ? 'room' : 'place'} to yourself</p>
              </div>
            </div>
            {listing.enhancedCleaning && (
              <div className="listing-detail__highlight">
                <span className="listing-detail__highlight-icon">✨</span>
                <div>
                  <p className="listing-detail__highlight-title">Enhanced Clean</p>
                  <p className="listing-detail__submeta">This host committed to Airbnb's 5-step enhanced cleaning process.</p>
                </div>
              </div>
            )}
            {listing.selfCheckIn && (
              <div className="listing-detail__highlight">
                <span className="listing-detail__highlight-icon">🔑</span>
                <div>
                  <p className="listing-detail__highlight-title">Self check-in</p>
                  <p className="listing-detail__submeta">Check yourself in with the keypad.</p>
                </div>
              </div>
            )}
            <div className="listing-detail__highlight">
              <span className="listing-detail__highlight-icon">📅</span>
              <div>
                <p className="listing-detail__highlight-title">Free cancellation before {listing.cancellationDeadline || 'Feb 14'}</p>
              </div>
            </div>
          </section>

          <section className="listing-detail__section">
            <p>{listing.description}</p>
          </section>

          <section className="listing-detail__section">
            <h2>Where you'll sleep</h2>
            <div className="listing-detail__sleep">
              <img src={bedroomPhoto} alt="Bedroom" className="listing-detail__sleep-photo" />
              <p className="listing-detail__sleep-label">Bedroom</p>
              <p className="listing-detail__submeta">{listing.bedType || '1 queen bed'}</p>
            </div>
          </section>

          <section className="listing-detail__section">
            <h2>What this place offers</h2>
            <div className="listing-detail__amenities">
              {visibleAmenities.map((a) => (
                <div key={a} className="listing-detail__amenity">{a}</div>
              ))}
            </div>
            {amenities.length > 8 && (
              <button className="btn btn-outline" onClick={() => setShowAllAmenities((v) => !v)}>
                {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
              </button>
            )}
          </section>

          <section className="listing-detail__section">
            <h2>
              {nightsBetween(checkIn, checkOut) > 0
                ? `${nightsBetween(checkIn, checkOut)} nights in ${listing.city}`
                : `Select dates to stay in ${listing.city}`}
            </h2>
            {checkIn && checkOut && (
              <p className="listing-detail__submeta">
                {checkIn} – {checkOut}
              </p>
            )}
            <DateRangeCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(nextCheckIn, nextCheckOut) => {
                setCheckIn(nextCheckIn);
                setCheckOut(nextCheckOut);
              }}
            />
          </section>

          <section className="listing-detail__section">
            <h2>★ {listing.rating?.toFixed(1) ?? '5.0'} · {listing.reviewCount ?? 0} reviews</h2>
            <div className="listing-detail__rating-grid">
              {Object.entries(categories).map(([label, score]) => (
                <RatingBar key={label} label={label} score={score} />
              ))}
            </div>
            <div className="listing-detail__reviews">
              {(listing.reviews || []).map((review) => (
                <ReviewComment key={review.name + review.date} review={review} />
              ))}
            </div>
          </section>

          <section className="listing-detail__section listing-detail__host">
            <img src={listing.hostAvatar} alt={listing.hostName} className="listing-detail__host-avatar" />
            <div>
              <h3>Hosted by {listing.hostName}</h3>
              <p className="listing-detail__submeta">Joined {listing.hostJoined}</p>
              <div className="listing-detail__host-badges">
                <span>★ {listing.reviewCount ?? 0} Reviews</span>
                {listing.hostVerified && <span>✓ Identity verified</span>}
                {listing.superhost && <span>🏆 Superhost</span>}
              </div>
              {listing.superhost && <p className="listing-detail__submeta">{listing.hostBio}</p>}
              <p className="listing-detail__submeta">Response rate: {listing.hostResponseRate ?? 100}%</p>
              <p className="listing-detail__submeta">Response time: {listing.hostResponseTime || 'within an hour'}</p>
              <button className="btn btn-outline">Contact Host</button>
              <p className="listing-detail__safety-note">
                🛡️ To protect your payment, never transfer money or communicate outside of the Airbnb website or app.
              </p>
            </div>
          </section>

          <section className="listing-detail__section listing-detail__things-to-know">
            <h2>Things to know</h2>
            <div className="listing-detail__things-grid">
              <div>
                <h4>House rules</h4>
                <ul>
                  <li>Check-in: After 4:00 PM</li>
                  <li>Checkout: 10:00 AM</li>
                  <li>{listing.selfCheckIn ? 'Self check-in with lockbox' : 'Host will greet you'}</li>
                  <li>Not suitable for infants (under 2 years)</li>
                  <li>No smoking</li>
                  <li>No pets</li>
                  <li>No parties or events</li>
                </ul>
              </div>
              <div>
                <h4>Health &amp; safety</h4>
                <ul>
                  <li>Committed to Airbnb's enhanced cleaning process</li>
                  <li>Airbnb's social-distancing and other COVID-19-related guidelines apply</li>
                  <li>Carbon monoxide alarm</li>
                  <li>Smoke alarm</li>
                  {listing.securityDeposit > 0 && (
                    <li>Security deposit – if you damage the home, you may be charged up to {listing.securityDeposit}</li>
                  )}
                </ul>
              </div>
              <div>
                <h4>Cancellation policy</h4>
                <p className="listing-detail__submeta">Free cancellation before {listing.cancellationDeadline || 'Feb 14'}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="listing-detail__aside">
          <BookingCard listing={listing} checkIn={checkIn} checkOut={checkOut} onDatesChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }} />
        </aside>
      </div>

      {countryInfo && (
        <section className="listing-detail__explore">
          <h2>Explore other options in {listing.country}</h2>
          <div className="listing-detail__explore-grid">
            {countryInfo.cities.map((city) => (
              <Link key={city} to={`/search?location=${encodeURIComponent(city)}`}>{city}</Link>
            ))}
          </div>

          <h3>Unique stays on Airbnb</h3>
          <div className="listing-detail__explore-grid">
            {UNIQUE_STAYS.map((stay) => (
              <span key={stay} className="listing-detail__explore-static">{stay}</span>
            ))}
          </div>

          <p className="listing-detail__breadcrumb">
            <Link to="/">Airbnb</Link> › {countryInfo.continent} › {listing.country} › {listing.city}
          </p>
        </section>
      )}
    </div>
  );
}
