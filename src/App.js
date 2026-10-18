import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import PlotMapPage     from './pages/PlotMapPage';
import PlotDetailPage  from './pages/PlotDetailPage';
import ElevationsPage  from './pages/ElevationsPage';
import ReportsPage     from './pages/ReportsPage';
import UsersPage       from './pages/UsersPage';
import NotFoundPage    from './pages/NotFoundPage';

// Layout
import MainLayout from './components/layout/MainLayout';

// Protected route wrapper
const ProtectedRoute = ({ children, ownerOnly = false }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-primary-700 font-semibold">Loading SatyamGold...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (ownerOnly && userProfile?.role !== 'owner') return <Navigate to="/" replace />;

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route path="/" element={
        <ProtectedRoute><MainLayout /></ProtectedRoute>
      }>
        <Route index                  element={<DashboardPage />} />
        <Route path="plots"           element={<PlotMapPage />} />
        <Route path="plots/:plotId"   element={<PlotDetailPage />} />
        <Route path="elevations"      element={
          <ProtectedRoute ownerOnly><ElevationsPage /></ProtectedRoute>
        } />
        <Route path="reports"         element={
          <ProtectedRoute ownerOnly><ReportsPage /></ProtectedRoute>
        } />
        <Route path="users"           element={
          <ProtectedRoute ownerOnly><UsersPage /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1f2937', color: '#fff', borderRadius: '8px' }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
