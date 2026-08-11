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
import { PersonalQuizPage } from '@/modules/home/pages/PersonalQuizPage';
import { ContactPage } from '@/modules/home/pages/ContactPage';
import { PrivacyPolicyPage } from '@/modules/home/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/modules/home/pages/TermsOfServicePage';
import { FaqPage } from '@/modules/home/pages/FaqPage';
import { BookingPage } from '@/modules/home/pages/BookingPage';
import { BookingSuccessPage } from '@/modules/home/pages/BookingSuccessPage';
import { StudentBookingsPage } from '@/modules/home/pages/StudentBookingsPage';
import { ConsultationHistoryPage } from '@/modules/home/pages/ConsultationHistoryPage';
import { ExpertDashboardPage } from '@/modules/home/pages/ExpertDashboardPage';
import { AdminDashboardPage } from '@/modules/home/pages/AdminDashboardPage';
import { ProfilePage } from '@/modules/profile/pages/ProfilePage';
import { SettingsPage } from '@/modules/settings/pages/SettingsPage';

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
        <Route path="/quiz" element={<PersonalQuizPage />} />
        <Route path="/personal-quiz" element={<PersonalQuizPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/faq" element={<FaqPage />} />

        {/* Protected routes */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/booking/:expertId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/booking-success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><StudentBookingsPage /></ProtectedRoute>} />
        <Route path="/consultation-history" element={<ProtectedRoute><ConsultationHistoryPage /></ProtectedRoute>} />
        <Route path="/expert-dashboard" element={<ProtectedRoute><ExpertDashboardPage /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/me" element={<Navigate to="/profile" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
