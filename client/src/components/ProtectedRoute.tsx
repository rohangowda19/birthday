import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: Role;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-ink-900/50 dark:text-paper-100/50">
        Loading…
      </div>
    );
  }

  // Remember where the user was headed so Login can send them back there
  // (e.g. tapping "masala puri" while logged out should return to /scan
  // after signing in, not dump them on the gift landing page).
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to="/scan" replace />;

  return <>{children}</>;
}