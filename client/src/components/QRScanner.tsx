import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onScan: (rawText: string) => void;
  active: boolean;
}

const ELEMENT_ID = 'upi-qr-reader';

export default function QRScanner({ onScan, active }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    setStarting(true);
    setError(null);

    const scanner = new Html5Qrcode(ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cancelled) return;
          onScan(decodedText);
        },
        () => {
          // per-frame scan failures are expected while searching; ignore
        }
      )
      .then(() => {
        if (!cancelled) setStarting(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Camera access failed. Check permissions and try again.');
          setStarting(false);
          console.error(err);
        }
      });

    return () => {
      cancelled = true;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          /* already stopped */
        });
    };
  }, [active, onScan]);

  return (
    <div className="relative">
      <div
        id={ELEMENT_ID}
        className="overflow-hidden rounded-lg border-2 border-brass-500/40 aspect-square w-full max-w-sm mx-auto bg-ink-900"
      />
      {starting && (
        <p className="text-center text-sm mt-3 font-mono text-ink-900/60 dark:text-paper-100/60">
          Starting camera…
        </p>
      )}
      {error && <p className="text-center text-sm mt-3 text-rust-600">{error}</p>}
    </div>
  );
}
