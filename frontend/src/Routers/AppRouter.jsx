import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import EventDetails from '../pages/EventDetails';
import SeatSelection from '../pages/SeatSelection';
import Checkout from '../pages/Checkout';
import MyBookings from '../pages/MyBookings';
import AdminDashboard from '../pages/AdminDashboard';
import OAuth2RedirectHandler from '../pages/OAuth2RedirectHandler';
import { useAuthStore } from '../store/useAuthStore';

// Protected Route wrapper
const ProtectedRoute = ({ children, roleRequired }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/events/:id" element={<EventDetails />} />
        
        <Route path="events/:id/seats" element={
          <ProtectedRoute>
            <SeatSelection />
          </ProtectedRoute>
        } />
        
        <Route path="checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        
        <Route path="my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        
        <Route path="admin" element={
          <ProtectedRoute roleRequired="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRouter;
