import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import RequestStub from '../components/RequestStub';
import { getRequest, myRequests } from '../api/requests';
import { useSocket } from '../hooks/useSocket';
import type { RelayRequest } from '../types';

export default function RequestStatus() {
  const { id } = useParams();
  const { socket } = useSocket();
  const [request, setRequest] = useState<RelayRequest | null>(null);
  const [history, setHistory] = useState<RelayRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getRequest(id)
      .then(setRequest)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    myRequests().then(setHistory).catch(() => {});
  }, [request?.status]);

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

        {history.length > 1 && (
          <div className="mt-10">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-900/50 dark:text-paper-100/50 mb-3">
              Your recent requests
            </p>
            <div className="space-y-3">
              {history
                .filter((r) => r._id !== id)
                .slice(0, 5)
                .map((r) => (
                  <Link key={r._id} to={`/status/${r._id}`}>
                    <RequestStub request={r} />
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
