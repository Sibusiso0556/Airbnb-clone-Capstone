import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ requireHost = false }) {
  const { isAuthenticated, isHost } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireHost && !isHost) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
