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
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

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
    setTorchSupported(false);
    setTorchOn(false);

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
          {
            fps: 12,
            // Use most of the visible camera frame as the scan area instead
            // of a small fixed box — much easier to line up a QR code with,
            // especially on phones where the preview itself is already small.
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.85);
              return { width: size, height: size };
            },
            // Ask for a higher-resolution feed where the device supports it —
            // more detail helps the decoder cope with glare, low light, or a
            // slightly angled/blurry shot of the code.
            videoConstraints: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1920 },
              advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet],
            },
          },
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
        if (cancelled) return;
        setStarting(false);

        // Flashlight support varies a lot by device/browser — check after
        // the camera is actually running, and just hide the button if it's
        // not available rather than erroring.
        try {
          const capabilities = scanner.getRunningTrackCameraCapabilities();
          const torchFeature = capabilities.torchFeature();
          setTorchSupported(torchFeature.isSupported());
        } catch {
          setTorchSupported(false);
        }
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

  function toggleTorch() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      const capabilities = scanner.getRunningTrackCameraCapabilities();
      const torchFeature = capabilities.torchFeature();
      const next = !torchOn;
      torchFeature.apply(next).then(() => setTorchOn(next));
    } catch (err) {
      console.error('Could not toggle flashlight:', err);
    }
  }

  return (
    <div className="relative">
      <div
        id={ELEMENT_ID}
        className="overflow-hidden rounded-lg border-2 border-brass-500/40 aspect-square w-full max-w-md mx-auto bg-ink-900"
      />

      {torchSupported && !starting && !error && (
        <button
          onClick={toggleTorch}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-lg backdrop-blur-sm transition-colors ${
            torchOn ? 'bg-brass-500 text-white' : 'bg-black/40 text-white/90'
          }`}
          aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight for glare or low light'}
          type="button"
        >
          💡
        </button>
      )}

      {starting && (
        <p className="text-center text-sm mt-3 font-mono text-ink-900/60 dark:text-paper-100/60">
          Starting camera…
        </p>
      )}
      {error && <p className="text-center text-sm mt-3 text-rust-600 max-w-sm mx-auto">{error}</p>}
      {!starting && !error && (
        <p className="text-center text-xs mt-3 text-ink-900/50 dark:text-paper-100/50 max-w-sm mx-auto">
          Trouble scanning? Fill the box with the code, avoid glare/reflections, and try the flashlight
          in low light.
        </p>
      )}
    </div>
  );
}