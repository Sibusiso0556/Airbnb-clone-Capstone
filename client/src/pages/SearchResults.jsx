import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/listing/SearchBar';
import ListingCard from '../components/listing/ListingCard';
import { useListings } from '../hooks/useListings';
import './SearchResults.css';

// One representative listing per distinct city, first one wins.
function groupByLocation(listings) {
  const seen = new Map();
  for (const listing of listings) {
    if (!seen.has(listing.city)) seen.set(listing.city, listing);
  }
  return Array.from(seen.values());
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = {
    location: searchParams.get('location') || undefined,
    checkIn: searchParams.get('checkIn') || undefined,
    checkOut: searchParams.get('checkOut') || undefined,
    guests: searchParams.get('guests') || undefined,
    page: searchParams.get('page') || 1,
    // No location selected yet: pull a broad set so we can group by city
    // into one card per location. Once a location is picked, this is unused.
    limit: searchParams.get('location') ? undefined : 100,
  };

  const { listings, pagination, loading, error } = useListings(params);
  const isOverview = !params.location;
  const locationCards = useMemo(() => (isOverview ? groupByLocation(listings) : []), [isOverview, listings]);

  function goToPage(page) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const displayList = isOverview ? locationCards : listings;
  const displayCount = isOverview ? locationCards.length : pagination?.total ?? listings.length;

  return (
    <div className="search-results">
      <div className="container search-results__search">
        <SearchBar />
      </div>

      <div className="container">
        <h1 className="search-results__heading">
          {isOverview ? (
            <>{displayCount} <span className="search-results__heading-link">locations to explore</span></>
          ) : (
            <>{displayCount} <span className="search-results__heading-link">stays in {params.location}</span></>
          )}
        </h1>

        {loading && <p className="search-results__status">Searching…</p>}
        {error && <p className="search-results__status search-results__status--error">{error}</p>}

        {!loading && !error && displayList.length === 0 && (
          <p className="search-results__status">No stays match your search. Try different dates or a wider area.</p>
        )}

        {!loading && !error && displayList.length > 0 && (
          <div className="homepage__grid">
            {displayList.map((listing) =>
              isOverview ? (
                <ListingCard
                  key={listing.city}
                  listing={listing}
                  linkTo={`/search?location=${encodeURIComponent(listing.city)}`}
                  showSave={false}
                />
              ) : (
                <ListingCard key={listing._id} listing={listing} />
              )
            )}
          </div>
        )}

        {!isOverview && pagination && pagination.totalPages > 1 && (
          <div className="search-results__pagination">
            <button
              className="btn btn-outline"
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
            >
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button
              className="btn btn-outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
