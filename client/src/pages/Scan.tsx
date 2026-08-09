import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import QRScanner from '../components/QRScanner';
import { parseUpiUri } from '../utils/parseUpi';
import { createRequest } from '../api/requests';
import type { ParsedUpi } from '../types';

export default function Scan() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [parsed, setParsed] = useState<ParsedUpi | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleScan = useCallback((rawText: string) => {
    try {
      const result = parseUpiUri(rawText);
      setParsed(result);
      setAmount(result.amount ? String(result.amount) : '');
      setScanning(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Could not read that QR code');
    }
  }, []);

  async function handleSend() {
    if (!parsed) return;
    const finalAmount = Number(amount);
    if (!finalAmount || finalAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const request = await createRequest(parsed.rawUri, finalAmount);
      navigate(`/status/${request._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send the request');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setParsed(null);
    setAmount('');
    setError(null);
    setScanning(true);
  }

  return (
    <Layout>
      <div className="max-w-sm mx-auto">
        <h1 className="font-display text-2xl mb-1">Scan a UPI QR</h1>
        <p className="text-sm text-ink-900/60 dark:text-paper-100/60 mb-6">
          Point your camera at any merchant's UPI code. Your admin pays it manually from their own
          UPI app once approved.
        </p>

        {scanning && <QRScanner active={scanning} onScan={handleScan} />}

        {parsed && (
          <div className="stub p-5 mt-4">
            <p className="font-display text-lg">{parsed.merchantName}</p>
            <p className="font-mono text-xs text-ink-900/60 dark:text-paper-100/60 mt-0.5">
              {parsed.merchantUPI}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-mono uppercase tracking-wide mb-1.5 text-ink-900/60 dark:text-paper-100/60">
                Amount ({parsed.currency})
              </label>
              <input
                type="number"
                min={1}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded border border-ink-900/15 dark:border-paper-50/20 bg-transparent px-3 py-2 font-mono text-lg focus:border-brass-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={reset}
                className="flex-1 py-2.5 rounded border border-ink-900/15 dark:border-paper-50/20 font-medium"
              >
                Rescan
              </button>
              <button
                onClick={handleSend}
                disabled={submitting}
                className="flex-1 py-2.5 rounded bg-brass-500 hover:bg-brass-600 disabled:opacity-60 text-paper-50 font-medium transition-colors"
              >
                {submitting ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-rust-600 text-sm mt-3">{error}</p>}
      </div>
    </Layout>
  );
}
