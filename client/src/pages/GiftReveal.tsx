import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PhotoTile from '../components/PhotoTile';
import BackgroundMedia from '../components/BackgroundMedia';

// ── Edit this section to personalize for your friend ───────────────────
const FRIEND_NAME = 'You'; // e.g. "Priya"
const MEMORIES = [
  { caption: '2nd Best Photo ', emoji: '🎉' },
  { caption: 'No brain', emoji: '🎬' },
  { caption: 'One Good Pic You Have', emoji: '🎂' },
  { caption: 'Best Photo Ever', emoji: '🥂' },
  { caption: 'bad face', emoji: '✨' },
  { caption: 'Another day, another banger moment', emoji: '📸' },
];
const REASONS = [
  {
    emoji: '🌮',
    text: "waste",
  },
  {
    emoji: '😂',
    text: "useless",
  },
  {
    emoji: '🥹',
    text: "No Hairs",
  },
  
  
];
// To use a real photo behind the "Happy Birthday" hero, drop a file at
// client/public/gift/hero.jpg — it'll be picked up automatically.
const HERO_IMAGE = '/gift/hero.jpg';
// Video background (optional): drop a file at client/public/gift/hero.mp4
// and set it below. If set, this takes priority over HERO_IMAGE.
const HERO_VIDEO = '/gift/landing.mp4'; // e.g. '/gift/hero.mp4'
// Drop real photos at client/public/gift/memory1.jpg, memory2.jpg, etc. and
// list them here in order (leave as undefined to keep the placeholder tiles).
const MEMORY_IMAGES = ['/gift/memory1.jpeg', '/gift/memory2.jpeg', '/gift/memory3.jpeg', '/gift/memory4.jpeg', '/gift/memory5.jpeg', '/gift/memory6.jpeg'];
// Optional: make any specific memory tile a looping video instead of a
// photo. Index matches MEMORIES above (0 = first tile, 1 = second, etc).
// e.g. { 2: '/gift/memory3.mp4' } makes the third tile a video.
const MEMORY_VIDEOS: Record<number, string> = {
  0: '/gift/memory1.mp4',
  5: '/gift/memory6.mp4',
  4: '/gift/memory5.mp4',
};
// ─────────────────────────────────────────────────────────────────────────

export default function GiftReveal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper-50">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[420px] overflow-hidden">
        <BackgroundMedia imageSrc={HERO_IMAGE} videoSrc={HERO_VIDEO} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A2E1F]/70 via-[#241A12]/60 to-[#120D08]" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper-50 via-transparent to-transparent" />

        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-10 px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-brass-400 font-mono text-xs uppercase tracking-[0.25em] mb-2"
          >
            🎉 Today is the day 🎉
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-script text-5xl sm:text-6xl text-white"
          >
            Happy Birthday! <span aria-hidden>🎂</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-1 text-paper-100/80 font-medium"
          >
            {FRIEND_NAME === 'You' ? 'You absolute legend' : `${FRIEND_NAME}, you absolute legend`}{' '}
            <span aria-hidden>✨</span>
          </motion.p>
        </div>
      </div>

      {/* Memory wall */}
      <section className="px-5 pt-10 max-w-lg mx-auto">
        <h2 className="font-script text-3xl text-brass-600 text-center">BSDK 📷</h2>
        <p className="text-center text-sm text-ink-900/60 mt-1 mb-6"></p>

        <div className="grid grid-cols-2 gap-3">
          {MEMORIES.map((m, i) => (
            <PhotoTile
              key={m.caption}
              caption={m.caption}
              emoji={m.emoji}
              src={MEMORY_IMAGES[i]}
              videoSrc={MEMORY_VIDEOS[i]}
              gradientIndex={i}
              className={i % 3 === 0 ? 'col-span-2 aspect-[16/10]' : undefined}
            />
          ))}
        </div>
      </section>

      {/* Why we love you */}
      <section className="px-5 pt-14 max-w-lg mx-auto">
        <h2 className="font-script text-3xl text-brass-600 text-center">🐐</h2>
        <p className="text-center text-sm text-ink-900/60 mt-1 mb-6"> REASON U R GOAT</p>

        <div className="space-y-3">
          {REASONS.map((r) => (
            <div key={r.text} className="stub p-4 flex items-start gap-3">
              <span className="text-2xl shrink-0" aria-hidden>
                {r.emoji}
              </span>
              <p className="text-sm leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The gift itself */}
      <section className="px-5 py-14 max-w-lg mx-auto text-center">
        <div className="h-px bg-brass-400/30 mb-8" />
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-900/50 mb-5">
          And now… the gift 🎁
        </p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/scan')}
          className="w-full sm:w-72 mx-auto py-8 rounded-2xl bg-gradient-to-br from-brass-500 to-brass-600 text-white shadow-stub flex flex-col items-center gap-2"
        >
          <span className="text-4xl" aria-hidden>
            🍲
          </span>
          <span className="font-display text-xl font-semibold leading-tight">
            Click to eat
            <br />
            masala puri
          </span>
          <span className="text-xs text-white/70">(tap when ready!)</span>
        </motion.button>
      </section>
    </div>
  );
}