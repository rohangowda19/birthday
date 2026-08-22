import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import RequestStub from '../components/RequestStub';
import { useSocket } from '../hooks/useSocket';
import { useNotify } from '../hooks/useNotify';
import { listRequests, approveRequest, rejectRequest, markPaid, getPayLink, deleteRequest } from '../api/requests';
import type { RelayRequest } from '../types';

// Simple, single-friend view: just the requests that still need your
// attention (pending) or that you've approved and are about to pay.
// History (paid/rejected/expired) is folded away below so the page stays
// uncluttered — this isn't meant to be a full multi-user admin console.

export default function AdminDashboard() {
  const { socket } = useSocket();
  const { notify, requestPermission } = useNotify();

  const [active, setActive] = useState<RelayRequest[]>([]);
  const [history, setHistory] = useState<RelayRequest[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [pending, approved, past] = await Promise.all([
      listRequests({ status: 'pending', limit: 50 }),
      listRequests({ status: 'approved', limit: 50 }),
      listRequests({ status: 'all', limit: 20 }),
    ]);
    setActive([...pending.requests, ...approved.requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setHistory(past.requests.filter((r) => r.status === 'paid' || r.status === 'rejected' || r.status === 'expired'));
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!socket) return;

    function onNew(request: RelayRequest) {
      notify('New payment request', `${request.merchantName} — ₹${request.amount}`);
      refresh();
    }
    function onUpdate() {
      refresh();
    }

    socket.on('request:new', onNew);
    socket.on('request:updated', onUpdate);
    return () => {
      socket.off('request:new', onNew);
      socket.off('request:updated', onUpdate);
    };
  }, [socket, notify, refresh]);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await approveRequest(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      await rejectRequest(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handlePayNow(id: string) {
    setBusyId(id);
    try {
      const url = await getPayLink(id);
      // Opens your own installed UPI app, pre-filled. You still have to
      // review and confirm the payment manually inside that app.
      window.location.href = url;
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkPaid(id: string) {
    setBusyId(id);
    try {
      await markPaid(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this request permanently? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await deleteRequest(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Layout>
      <h1 className="font-display text-2xl mb-6">Requests</h1>

      <div className="space-y-4">
        {active.length === 0 && (
          <p className="text-sm text-ink-900/50 dark:text-paper-100/50 font-mono">
            Nothing waiting right now. When your friend scans a QR, it'll show up here instantly.
          </p>
        )}

        {active.map((r) => (
          <RequestStub key={r._id} request={r} showRequester>
            <div className="flex gap-2 flex-wrap">
              {r.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(r._id)}
                    disabled={busyId === r._id}
                    className="px-3 py-1.5 rounded bg-forest-600 text-paper-50 text-sm font-medium disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(r._id)}
                    disabled={busyId === r._id}
                    className="px-3 py-1.5 rounded bg-rust-600 text-paper-50 text-sm font-medium disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              )}
              {r.status === 'approved' && (
                <>
                  <button
                    onClick={() => handlePayNow(r._id)}
                    disabled={busyId === r._id}
                    className="px-3 py-1.5 rounded bg-brass-500 text-paper-50 text-sm font-medium disabled:opacity-60"
                  >
                    Open UPI app to pay
                  </button>
                  <button
                    onClick={() => handleMarkPaid(r._id)}
                    disabled={busyId === r._id}
                    className="px-3 py-1.5 rounded border border-forest-600 text-forest-600 text-sm font-medium disabled:opacity-60"
                  >
                    Mark paid
                  </button>
                </>
              )}
            </div>
          </RequestStub>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="text-xs font-mono uppercase tracking-wide text-ink-900/50 dark:text-paper-100/50 hover:text-brass-600 dark:hover:text-brass-400"
          >
            {showHistory ? 'Hide' : 'Show'} history ({history.length})
          </button>
          {showHistory && (
            <div className="space-y-3 mt-4">
              {history.map((r) => (
                <RequestStub key={r._id} request={r} showRequester>
                  <button
                    onClick={() => handleDelete(r._id)}
                    disabled={busyId === r._id}
                    className="px-3 py-1.5 rounded border border-rust-600 text-rust-600 text-sm font-medium disabled:opacity-60"
                  >
                    Delete
                  </button>
                </RequestStub>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}