import type { ParsedUpi } from '../types';

export function parseUpiUri(rawUri: string): ParsedUpi {
  const trimmed = rawUri.trim();
  if (!/^upi:\/\/pay\?/i.test(trimmed)) {
    throw new Error('That QR code is not a UPI payment code');
  }

  const queryString = trimmed.substring(trimmed.indexOf('?') + 1);
  const params = new URLSearchParams(queryString);

  const pa = params.get('pa');
  if (!pa) throw new Error('QR code is missing a merchant UPI ID');

  const am = params.get('am');
  const amount = am ? Number(am) : null;

  return {
    merchantUPI: pa,
    merchantName: params.get('pn') || pa,
    amount: amount && !Number.isNaN(amount) ? amount : null,
    currency: params.get('cu') || 'INR',
    transactionRef: params.get('tr') || '',
    transactionNote: params.get('tn') || '',
    merchantCode: params.get('mc') || '',
    rawUri: trimmed,
  };
}
