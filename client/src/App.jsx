import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Homepage from './pages/Homepage';
import SearchResults from './pages/SearchResults';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Trips from './pages/Trips';
import Wishlist from './pages/Wishlist';
import HostDashboard from './pages/HostDashboard';
import HostReservations from './pages/HostReservations';
import CreateListing from './pages/CreateListing';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/become-a-host" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/trips" element={<Trips />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        <Route element={<ProtectedRoute requireHost />}>
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/host/reservations" element={<HostReservations />} />
          <Route path="/host/listings/new" element={<CreateListing />} />
          <Route path="/host/listings/:id/edit" element={<CreateListing />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
