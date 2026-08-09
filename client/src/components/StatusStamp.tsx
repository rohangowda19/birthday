import type { RequestStatus } from '../types';

const STYLES: Record<RequestStatus, string> = {
  pending: 'text-brass-600 dark:text-brass-400',
  approved: 'text-forest-600 dark:text-forest-500',
  paid: 'text-forest-600 dark:text-forest-500',
  rejected: 'text-rust-600',
  expired: 'text-ink-900/40 dark:text-paper-100/40',
};

const LABELS: Record<RequestStatus, string> = {
  pending: 'Waiting for admin',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
  expired: 'Expired',
};

export default function StatusStamp({ status }: { status: RequestStatus }) {
  return <span className={`stamp ${STYLES[status]}`}>{LABELS[status]}</span>;
}
