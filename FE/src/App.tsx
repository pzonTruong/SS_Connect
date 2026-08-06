import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { RegisterPage } from '@/modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage';
import { LogoutPage } from '@/modules/auth/pages/LogoutPage';
import { HomePage } from '@/modules/home/pages/HomePage';
import { ExpertsListPage } from '@/modules/home/pages/ExpertsListPage';
import { ExpertProfilePage } from '@/modules/home/pages/ExpertProfilePage';
import { ResourcesPage } from '@/modules/home/pages/ResourcesPage';
import { ContactPage } from '@/modules/home/pages/ContactPage';
import { BookingPage } from '@/modules/home/pages/BookingPage';
import { BookingSuccessPage } from '@/modules/home/pages/BookingSuccessPage';
import { StudentBookingsPage } from '@/modules/home/pages/StudentBookingsPage';
import { ExpertDashboardPage } from '@/modules/home/pages/ExpertDashboardPage';
import { AdminDashboardPage } from '@/modules/home/pages/AdminDashboardPage';
import { ProfilePage } from '@/modules/profile/pages/ProfilePage';

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="/logout" element={<LogoutPage />} />

      {/* Main layout routes */}
      <Route element={<AppLayout />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/experts" element={<ExpertsListPage />} />
        <Route path="/experts/:id" element={<ExpertProfilePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Protected routes */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/booking/:expertId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/booking-success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><StudentBookingsPage /></ProtectedRoute>} />
        <Route path="/expert-dashboard" element={<ProtectedRoute><ExpertDashboardPage /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/me" element={<Navigate to="/profile" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
