/**
 * Parses a UPI deep-link URI, e.g.:
 *   upi://pay?pa=merchant@upi&pn=ABC%20Store&am=250&cu=INR&tr=abc123&tn=Order+42&mc=1234
 *
 * This only reads and structures data already encoded in the QR by the merchant's
 * payment provider. It never generates, signs, or authorizes a payment.
 */
function parseUpiUri(rawUri) {
  if (typeof rawUri !== 'string' || !rawUri.trim()) {
    throw new Error('Empty QR content');
  }

  const trimmed = rawUri.trim();
  if (!/^upi:\/\/pay\?/i.test(trimmed)) {
    throw new Error('Not a valid UPI payment QR code');
  }

  // Normalize so URLSearchParams can parse it (it doesn't need a real host).
  const queryString = trimmed.substring(trimmed.indexOf('?') + 1);
  const params = new URLSearchParams(queryString);

  const pa = params.get('pa'); // payee UPI address
  const pn = params.get('pn'); // payee name
  const am = params.get('am'); // amount
  const cu = params.get('cu') || 'INR';
  const tr = params.get('tr') || '';
  const tn = params.get('tn') || '';
  const mc = params.get('mc') || '';

  if (!pa) {
    throw new Error('QR code is missing a merchant UPI ID (pa)');
  }

  const amount = am ? Number(am) : null;
  if (am && (Number.isNaN(amount) || amount <= 0)) {
    throw new Error('QR code contains an invalid amount');
  }

  return {
    merchantUPI: pa,
    merchantName: pn ? decodeURIComponent(pn) : pa,
    amount,
    currency: cu,
    transactionRef: tr,
    transactionNote: tn ? decodeURIComponent(tn) : '',
    merchantCode: mc,
    rawUri: trimmed,
  };
}

/**
 * Builds a upi://pay deep link for the admin to open in their own installed UPI app.
 * This link only pre-fills the payment app; the human still must review and
 * authorize the payment inside that app. Nothing here submits a payment.
 */
function buildUpiPayLink({ merchantUPI, merchantName, amount, currency, transactionRef, transactionNote }) {
  const params = new URLSearchParams();
  params.set('pa', merchantUPI);
  params.set('pn', merchantName || merchantUPI);
  if (amount) params.set('am', String(amount));
  params.set('cu', currency || 'INR');
  if (transactionRef) params.set('tr', transactionRef);
  if (transactionNote) params.set('tn', transactionNote);
  return `upi://pay?${params.toString()}`;
}

module.exports = { parseUpiUri, buildUpiPayLink };
