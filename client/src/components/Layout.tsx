import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-900/10 dark:border-paper-50/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-display text-lg">
            UPI Relay
          </Link>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm font-mono uppercase tracking-wide text-ink-900/60 dark:text-paper-100/60 hover:text-brass-600 dark:hover:text-brass-400"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/scan"
              className="text-sm font-mono uppercase tracking-wide text-ink-900/60 dark:text-paper-100/60 hover:text-brass-600 dark:hover:text-brass-400"
            >
              Scan
            </Link>
            <DarkModeToggle />
            {user && (
              <button
                onClick={handleLogout}
                className="text-sm text-ink-900/50 dark:text-paper-100/50 hover:text-rust-600"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
