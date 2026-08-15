import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onScan: (rawText: string) => void;
  active: boolean;
}

const ELEMENT_ID = 'upi-qr-reader';

function getUnsupportedReason(): string | null {
  if (typeof window === 'undefined') return null;

  // Browsers only allow camera access on HTTPS, or on localhost as a
  // special exception for local development. Any other plain-HTTP origin
  // (e.g. a LAN IP like http://10.0.0.5:5173) gets silently denied camera
  // access, which crashes libraries that assume it's available. Detect it
  // up front and show a clear message instead of letting it throw.
  if (!window.isSecureContext) {
    return 'Camera access needs a secure (HTTPS) connection. Open this site over HTTPS, or use localhost for local testing.';
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return "This browser doesn't support camera access here.";
  }
  return null;
}

export default function QRScanner({ onScan, active }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!active) return;

    const unsupportedReason = getUnsupportedReason();
    if (unsupportedReason) {
      setError(unsupportedReason);
      setStarting(false);
      return;
    }

    let cancelled = false;
    setStarting(true);
    setError(null);

    let scanner: Html5Qrcode;
    try {
      scanner = new Html5Qrcode(ELEMENT_ID);
      scannerRef.current = scanner;
    } catch (err) {
      setError('Could not start the scanner on this device.');
      setStarting(false);
      console.error(err);
      return;
    }

    Promise.resolve()
      .then(() =>
        scanner.start(
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
          /* already stopped, or never started */
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
      {error && <p className="text-center text-sm mt-3 text-rust-600 max-w-sm mx-auto">{error}</p>}
    </div>
  );
}