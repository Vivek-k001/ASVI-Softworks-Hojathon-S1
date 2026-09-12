import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { AssistantProvider } from './context/AssistantContext';

import { MainLayout } from './layouts/MainLayout';
import { BusinessLayout } from './layouts/BusinessLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home';
import { Deals } from './pages/Deals';
import { OfferDetail } from './pages/OfferDetail';
import { Businesses } from './pages/Businesses';
import { BusinessDetail } from './pages/BusinessDetail';
import { Food } from './pages/Food';
import { AssistantPage } from './pages/AssistantPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BusinessLogin } from './pages/BusinessLogin';
import { BusinessRegister } from './pages/BusinessRegister';

// Merchant portal pages
import { Dashboard } from './pages/business/Dashboard';
import { OffersList } from './pages/business/OffersList';
import { CreateOffer } from './pages/business/CreateOffer';
import { Profile } from './pages/business/Profile';
import { ShowcaseManager } from './pages/business/ShowcaseManager';
import { PaymentHistory } from './pages/business/PaymentHistory';

// Admin portal pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBusinesses } from './pages/admin/AdminBusinesses';
import { AdminOffers } from './pages/admin/AdminOffers';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSubscriptions } from './pages/admin/AdminSubscriptions';

// Protected Route wrappers
const ProtectedBusinessRoute = ({ children }) => {
  const { user, isBusiness, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || (!isBusiness && !isAdmin)) {
    return <Navigate to="/business/login" replace />;
  }
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <AssistantProvider>
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="deals" element={<Deals />} />
                <Route path="offers/:id" element={<OfferDetail />} />
                <Route path="businesses" element={<Businesses />} />
                <Route path="businesses/:id" element={<BusinessDetail />} />
                <Route path="food" element={<Food />} />
                <Route path="assistant" element={<AssistantPage />} />

                {/* Authentication Routes */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="business/login" element={<BusinessLogin />} />
                <Route path="business/register" element={<BusinessRegister />} />
              </Route>

              {/* Business Merchant Portal Routes with Light SaaS Sidebar */}
              <Route
                path="business"
                element={
                  <ProtectedBusinessRoute>
                    <BusinessLayout />
                  </ProtectedBusinessRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="showcase" element={<ShowcaseManager />} />
                <Route path="payments" element={<PaymentHistory />} />
                <Route path="offers" element={<OffersList />} />
                <Route path="offers/new" element={<CreateOffer />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Admin Portal Routes with Light SaaS Sidebar */}
              <Route
                path="admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="businesses" element={<AdminBusinesses />} />
                <Route path="offers" element={<AdminOffers />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AssistantProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
