import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const LOCATIONS = ['All Locations', 'New York', 'Paris', 'Tokyo', 'Cape Town', 'Thailand'];

export default function SearchBar({ compact = false, homepage = false }) {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [openField, setOpenField] = useState(null); // 'location' | 'guests' | null
  const navigate = useNavigate();
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenField(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToSearch(overrides = {}) {
    const params = new URLSearchParams();
    const finalLocation = overrides.location ?? location;
    if (finalLocation && finalLocation !== 'All Locations') params.set('location', finalLocation);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    const totalGuests = adults + children;
    if (totalGuests > 0) params.set('guests', totalGuests);
    navigate(`/search?${params.toString()}`);
  }

  function handleSelectLocation(loc) {
    setLocation(loc);
    setOpenField(null);
    goToSearch({ location: loc });
  }

  function handleSubmit(e) {
    e.preventDefault();
    goToSearch();
  }

  const totalGuests = adults + children;

  return (
    <form className={`searchbar ${compact ? 'searchbar--compact' : ''}`} onSubmit={handleSubmit} ref={rootRef}>
      <div className="searchbar__field searchbar__field--dropdown">
        <button
          type="button"
          className="searchbar__field-trigger"
          onClick={() => setOpenField((f) => (f === 'location' ? null : 'location'))}
        >
          <span>{homepage ? 'Hotels' : 'Locations'}</span>
          <span className="searchbar__value">{location || (homepage ? 'Select Hotel' : 'Select a Location')}</span>
        </button>
        {openField === 'location' && (
          <ul className="searchbar__dropdown" role="listbox">
            {LOCATIONS.map((loc) => (
              <li key={loc}>
                <button type="button" onClick={() => handleSelectLocation(loc)}>
                  {loc}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="searchbar__divider" />
      <label className="searchbar__field">
        <span>{homepage ? 'Check in' : 'Check in date'}</span>
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </label>
      <div className="searchbar__divider" />
      <label className="searchbar__field">
        <span>{homepage ? 'Check out' : 'Checkout date'}</span>
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      </label>
      <div className="searchbar__divider" />

      <div className="searchbar__field searchbar__field--dropdown">
        <button
          type="button"
          className="searchbar__field-trigger"
          onClick={() => setOpenField((f) => (f === 'guests' ? null : 'guests'))}
        >
          <span>Guests</span>
          <span className="searchbar__value">{totalGuests > 0 ? `${totalGuests} guests` : homepage ? 'Add guests' : '0 guests'}</span>
        </button>
        {openField === 'guests' && (
          <div className="searchbar__dropdown searchbar__dropdown--guests">
            <p className="searchbar__dropdown-title">Guests</p>
            <div className="searchbar__stepper-row">
              <span>Adults</span>
              <div className="searchbar__stepper">
                <button
                  type="button"
                  onClick={() => setAdults((n) => Math.max(0, n - 1))}
                  disabled={adults === 0}
                  aria-label="Decrease adults"
                >
                  –
                </button>
                <span>{adults}</span>
                <button type="button" onClick={() => setAdults((n) => n + 1)} aria-label="Increase adults">
                  +
                </button>
              </div>
            </div>
            <div className="searchbar__stepper-row">
              <span>Children</span>
              <div className="searchbar__stepper">
                <button
                  type="button"
                  onClick={() => setChildren((n) => Math.max(0, n - 1))}
                  disabled={children === 0}
                  aria-label="Decrease children"
                >
                  –
                </button>
                <span>{children}</span>
                <button type="button" onClick={() => setChildren((n) => n + 1)} aria-label="Increase children">
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="searchbar__submit" aria-label="Search">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.6" />
          <path d="M11.5 11.5L15 15" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
