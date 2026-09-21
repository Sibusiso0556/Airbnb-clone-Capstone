import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">Back to homepage</Link>
    </div>
  );
}
