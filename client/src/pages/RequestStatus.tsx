import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import RequestStub from '../components/RequestStub';
import { getRequest } from '../api/requests';
import { useSocket } from '../hooks/useSocket';
import type { RelayRequest } from '../types';

// Intentionally shows only the single request the requester just sent —
// no history of past requests. Keeps things private: a friend using this
// shouldn't see a trail of everything they've scanned before.
export default function RequestStatus() {
  const { id } = useParams();
  const { socket } = useSocket();
  const [request, setRequest] = useState<RelayRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getRequest(id)
      .then(setRequest)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    function onUpdate(updated: RelayRequest) {
      if (updated._id === id) setRequest(updated);
    }
    socket.on('request:updated', onUpdate);
    return () => {
      socket.off('request:updated', onUpdate);
    };
  }, [socket, id]);

  return (
    <Layout>
      <div className="max-w-sm mx-auto">
        <h1 className="font-display text-2xl mb-6">Payment request</h1>

        {loading && <p className="font-mono text-sm text-ink-900/50">Loading…</p>}
        {!loading && !request && <p className="text-sm text-rust-600">Request not found.</p>}
        {request && <RequestStub request={request} />}

        <Link
          to="/scan"
          className="block text-center mt-6 text-sm text-brass-600 dark:text-brass-400 hover:underline"
        >
          Scan another QR
        </Link>
      </div>
    </Layout>
  );
}