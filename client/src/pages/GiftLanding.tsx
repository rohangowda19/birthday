import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ── Edit this to personalize ────────────────────────────────────────────
const HEADLINE = "Something's here\nfor you";
const SUBTEXT = 'No spoilers. No hints.\nJust tap below.';
const FOOTNOTE = "(it's a good one, trust me)";
// To use a real photo of your friend as the background, drop a file at
// client/public/gift/landing.jpg and it'll be picked up automatically.
// Until then, a warm gradient stands in for it.
const BACKGROUND_IMAGE = '/gift/landing.jpg';
// ─────────────────────────────────────────────────────────────────────────

export default function GiftLanding() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#3A2E1F] via-[#241A12] to-[#120D08]">
      {/* Background photo (falls back to gradient if the file doesn't exist) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/80" />

      {/* Floating balloons — ambient, respects reduced-motion via global CSS */}
      <Balloon className="left-[8%] bottom-[12%]" color="#EF4444" delay={0} />
      <Balloon className="right-[10%] bottom-[20%]" color="#14B8A6" delay={1.2} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl mb-4"
          role="img"
          aria-label="gift"
        >
          🎁
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-script text-5xl sm:text-6xl leading-tight text-brass-400 whitespace-pre-line"
        >
          {HEADLINE} <span aria-hidden>👀</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 text-paper-100/80 whitespace-pre-line"
        >
          {SUBTEXT} <span aria-hidden>🤫</span>
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/reveal')}
          className="mt-8 px-10 py-4 rounded-full bg-gradient-to-r from-brass-500 to-brass-600 text-white font-semibold text-lg shadow-stub"
        >
          Check your gift <span aria-hidden>✨</span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-4 text-xs text-paper-100/50"
        >
          {FOOTNOTE}
        </motion.p>
      </div>
    </div>
  );
}

function Balloon({ className, color, delay }: { className: string; color: string; delay: number }) {
  return (
    <motion.div
      className={`absolute ${className} text-4xl`}
      style={{ color }}
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
      aria-hidden
    >
      🎈
    </motion.div>
  );
}