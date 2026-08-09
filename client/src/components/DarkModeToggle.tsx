import { useDarkMode } from '../hooks/useDarkMode';

export default function DarkModeToggle() {
  const { dark, toggle } = useDarkMode();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full w-9 h-9 flex items-center justify-center border border-ink-900/15 dark:border-paper-50/20 hover:bg-ink-900/5 dark:hover:bg-paper-50/10 transition-colors"
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}
