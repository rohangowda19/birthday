import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import QRScanner from '../components/QRScanner';
import { parseUpiUri } from '../utils/parseUpi';
import { createRequest } from '../api/requests';
import type { ParsedUpi } from '../types';

type Stage = 'idle' | 'scanning' | 'review' | 'manual';

export default function Scan() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('idle');
  const [parsed, setParsed] = useState<ParsedUpi | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Manual-entry fallback fields, for when scanning just won't cooperate
  // (bad glare, damaged sticker, low-quality camera, etc.)
  const [manualUpiId, setManualUpiId] = useState('');
  const [manualName, setManualName] = useState('');

  const handleScan = useCallback((rawText: string) => {
    try {
      const result = parseUpiUri(rawText);
      setParsed(result);
      setAmount(result.amount ? String(result.amount) : '');
      setStage('review');
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

  async function handleManualSend() {
    const finalAmount = Number(amount);
    if (!manualUpiId.trim()) {
      setError('Enter the merchant UPI ID');
      return;
    }
    if (!finalAmount || finalAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    const name = manualName.trim() || manualUpiId.trim();
    const rawUri = `upi://pay?pa=${encodeURIComponent(manualUpiId.trim())}&pn=${encodeURIComponent(
      name
    )}&am=${finalAmount}&cu=INR`;

    setSubmitting(true);
    setError(null);
    try {
      const request = await createRequest(rawUri, finalAmount);
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
    setManualUpiId('');
    setManualName('');
    setStage('idle');
  }

  return (
    <Layout>
      <div className="max-w-sm mx-auto">
        {stage === 'idle' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <button
              onClick={() => setStage('scanning')}
              className="w-40 h-40 rounded-full bg-brass-500 hover:bg-brass-600 text-paper-50 font-display text-2xl shadow-stub transition-colors flex items-center justify-center"
              aria-label="Scan a UPI QR code"
            >
              Scan
            </button>
            <p className="text-sm text-ink-900/60 dark:text-paper-100/60 mt-6 max-w-[16rem]">
              Tap to point your camera at any merchant's UPI QR code.
            </p>
          </div>
        )}

        {stage === 'scanning' && (
          <>
            <h1 className="font-display text-2xl mb-1 text-center">Scan a UPI QR</h1>
            <p className="text-sm text-ink-900/60 dark:text-paper-100/60 mb-6 text-center">
              Point your camera at any merchant's UPI code.
            </p>
            <QRScanner active={stage === 'scanning'} onScan={handleScan} />
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setStage('idle')}
                className="text-sm text-ink-900/50 dark:text-paper-100/50 hover:text-rust-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setStage('manual');
                }}
                className="text-sm text-brass-600 dark:text-brass-400 hover:underline"
              >
                Can't scan it? Enter manually
              </button>
            </div>
          </>
        )}

        {stage === 'manual' && (
          <div className="stub p-5 mt-4">
            <p className="font-display text-lg mb-1">Enter payment details</p>
            <p className="text-xs text-ink-900/50 dark:text-paper-100/50 mb-4">
              Use this if the QR code won't scan — you can usually find the UPI ID printed under
              or near the code.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5 text-ink-900/60 dark:text-paper-100/60">
                  Merchant UPI ID
                </label>
                <input
                  type="text"
                  value={manualUpiId}
                  onChange={(e) => setManualUpiId(e.target.value)}
                  placeholder="merchant@bank"
                  className="w-full rounded border border-ink-900/15 dark:border-paper-50/20 bg-transparent px-3 py-2 font-mono focus:border-brass-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5 text-ink-900/60 dark:text-paper-100/60">
                  Merchant name (optional)
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Shop name"
                  className="w-full rounded border border-ink-900/15 dark:border-paper-50/20 bg-transparent px-3 py-2 focus:border-brass-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5 text-ink-900/60 dark:text-paper-100/60">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded border border-ink-900/15 dark:border-paper-50/20 bg-transparent px-3 py-2 font-mono text-lg focus:border-brass-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setStage('scanning')}
                className="flex-1 py-2.5 rounded border border-ink-900/15 dark:border-paper-50/20 font-medium"
              >
                Back to scan
              </button>
              <button
                onClick={handleManualSend}
                disabled={submitting}
                className="flex-1 py-2.5 rounded bg-brass-500 hover:bg-brass-600 disabled:opacity-60 text-paper-50 font-medium transition-colors"
              >
                {submitting ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </div>
        )}

        {stage === 'review' && parsed && (
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

        {error && <p className="text-rust-600 text-sm mt-3 text-center">{error}</p>}
      </div>
    </Layout>
  );
}