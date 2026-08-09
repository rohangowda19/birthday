import { motion } from 'framer-motion';
import type { RelayRequest, User } from '../types';
import StatusStamp from './StatusStamp';

interface Props {
  request: RelayRequest;
  children?: React.ReactNode;
  showRequester?: boolean;
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export default function RequestStub({ request, children, showRequester }: Props) {
  const requesterName =
    typeof request.requester === 'object' ? (request.requester as User).name : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="stub p-5"
    >
      <span className="stub-notch -left-2" />
      <span className="stub-notch -right-2" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg leading-tight">{request.merchantName}</p>
          <p className="font-mono text-xs text-ink-900/60 dark:text-paper-100/60 mt-0.5">
            {request.merchantUPI}
          </p>
        </div>
        <StatusStamp status={request.status} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <p className="font-mono text-2xl font-semibold">
          {formatAmount(request.amount, request.currency)}
        </p>
        <p className="text-xs text-ink-900/50 dark:text-paper-100/50 font-mono">
          {new Date(request.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {showRequester && requesterName && (
        <p className="mt-2 text-xs text-ink-900/50 dark:text-paper-100/50">
          Requested by <span className="font-medium">{requesterName}</span>
        </p>
      )}

      {request.transactionNote && (
        <p className="mt-2 text-sm italic text-ink-900/70 dark:text-paper-100/70">
          "{request.transactionNote}"
        </p>
      )}

      {children && <div className="mt-4 pt-4 border-t border-dashed border-ink-900/15 dark:border-paper-50/15">{children}</div>}
    </motion.div>
  );
}
