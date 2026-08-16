import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Scan from './pages/Scan';
import RequestStatus from './pages/RequestStatus';
import AdminDashboard from './pages/AdminDashboard';
import GiftLanding from './pages/GiftLanding';
import GiftReveal from './pages/GiftReveal';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public gift-reveal flow — no login needed to view these */}
            <Route path="/" element={<GiftLanding />} />
            <Route path="/reveal" element={<GiftReveal />} />

            <Route path="/login" element={<Login />} />
            <Route
              path="/scan"
              element={
                <ProtectedRoute>
                  <Scan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/status/:id"
              element={
                <ProtectedRoute>
                  <RequestStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}