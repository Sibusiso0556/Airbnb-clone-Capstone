import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isHost, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const isHome = routerLocation.pathname === '/';

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className={`navbar ${isHome ? 'navbar--dark' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="Airbnb home">
          <img
            src={isHome ? '/branding/logo-icon-white.png' : '/branding/logo-icon-red.png'}
            alt=""
            width="24"
            height="24"
          />
          <span>airbnb</span>
        </Link>

        <nav className="navbar__links">
          <Link to="/">Places to stay</Link>
          <Link to="/experiences">Experiences</Link>
          <Link to="/online-experiences">Online Experiences</Link>
        </nav>

        <div className="navbar__actions">
          {isHost ? (
            <Link to="/host" className="navbar__host-link">Host dashboard</Link>
          ) : (
            <Link to="/become-a-host" className="navbar__host-link">Become a Host</Link>
          )}
          <button type="button" className="navbar__globe" aria-label="Choose a language and region">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2.75 12h18.5M12 2.75c2.5 2.6 3.75 6 3.75 9.25S14.5 20.65 12 23.25M12 2.75c-2.5 2.6-3.75 6-3.75 9.25S9.5 20.65 12 23.25" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div className="navbar__menu-wrap">
            <button
              className="navbar__menu-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 3h14M1 8h14M1 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="navbar__avatar">{user ? user.name?.[0]?.toUpperCase() : ''}</span>
            </button>
            {menuOpen && (
              <div className="navbar__dropdown" role="menu">
                {isAuthenticated ? (
                  <>
                    <span className="navbar__dropdown-name">{user.name}</span>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlists</Link>
                    <Link to="/trips" onClick={() => setMenuOpen(false)}>My trips</Link>
                    {isHost && <Link to="/host" onClick={() => setMenuOpen(false)}>My listings</Link>}
                    <button onClick={handleLogout}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
                    <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
