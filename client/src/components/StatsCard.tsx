export default function StatsCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-ink-900/10 dark:border-paper-50/10 bg-paper-100 dark:bg-ink-700 p-4">
      <p className="text-xs uppercase tracking-wider font-mono text-ink-900/50 dark:text-paper-100/50">
        {label}
      </p>
      <p className="font-display text-3xl mt-1">{value}</p>
    </div>
  );
}
