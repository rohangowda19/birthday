import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-brass-600 dark:text-brass-400">
            Private ledger
          </p>
          <h1 className="font-display text-3xl mt-1">UPI Relay</h1>
        </div>

        <form onSubmit={handleSubmit} className="stub p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide mb-1.5 text-ink-900/60 dark:text-paper-100/60">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-ink-900/15 dark:border-paper-50/20 bg-transparent px-3 py-2 focus:border-brass-500"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide mb-1.5 text-ink-900/60 dark:text-paper-100/60">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-ink-900/15 dark:border-paper-50/20 bg-transparent px-3 py-2 focus:border-brass-500"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-rust-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded bg-brass-500 hover:bg-brass-600 disabled:opacity-60 text-paper-50 font-medium transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs mt-6 text-ink-900/40 dark:text-paper-100/40">
          Access is invite-only. Ask your admin for a login if you don't have one.
        </p>
      </div>
    </div>
  );
}
