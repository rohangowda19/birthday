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
    text: 'waste',
  },
  {
    emoji: '😂',
    text: 'useless',
  },
  {
    emoji: '🥹',
    text: 'No Hairs',
  },
];
// This now plays as a full-page fixed background behind everything as you
// scroll, not just behind the hero. Drop a file at client/public/gift/hero.jpg
// (photo) or hero.mp4 (video, takes priority if set) to use it.
const HERO_IMAGE = '/gift/hero.jpg';
const HERO_VIDEO = '/gift/landing.mp4'; // e.g. '/gift/hero.mp4'
// Drop real photos at client/public/gift/memory1.jpeg, memory2.jpeg, etc.
const MEMORY_IMAGES = [
  '/gift/memory1.jpeg',
  '/gift/memory2.jpeg',
  '/gift/memory3.jpeg',
  '/gift/memory4.jpeg',
  '/gift/memory5.jpeg',
  '/gift/memory6.jpeg',
];
// Make specific tiles a looping video instead of a photo. Index is
// zero-based: 0 = tile 1, 1 = tile 2, etc.
const MEMORY_VIDEOS: Record<number, string> = {
  0: '/gift/memory1.mp4',
  5: '/gift/memory6.mp4',
  4: '/gift/memory5.mp4',
};
// ─────────────────────────────────────────────────────────────────────────

// Shared translucent panel so text stays readable over the moving video
// background as the page scrolls.
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-[#120D08]/70 backdrop-blur-md border border-white/5 ${className}`}>
      {children}
    </div>
  );
}

export default function GiftReveal() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-paper-100">
      {/* Fixed full-page video/photo background — stays put as the page scrolls */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#241A12] via-[#1A120C] to-[#0A0705]">
        <BackgroundMedia imageSrc={HERO_IMAGE} videoSrc={HERO_VIDEO} opacityClassName="opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
      </div>

      {/* Hero text, sitting over the fixed background */}
      <div className="relative h-[70vh] min-h-[420px] flex flex-col items-center justify-end pb-10 px-6 text-center">
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

      {/* Memory wall */}
      <section className="relative px-5 pt-4 max-w-lg mx-auto">
        <Panel className="p-5">
          <h2 className="font-script text-3xl text-brass-400 text-center">BSDK 📷</h2>
          <p className="text-center text-sm text-paper-100/60 mt-1 mb-6"></p>

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
        </Panel>
      </section>

      {/* Why we love you */}
      <section className="relative px-5 pt-8 max-w-lg mx-auto">
        <Panel className="p-5">
          <h2 className="font-script text-3xl text-brass-400 text-center">🐐</h2>
          <p className="text-center text-sm text-paper-100/60 mt-1 mb-6"> REASON U R GOAT</p>

          <div className="space-y-3">
            {REASONS.map((r) => (
              <div
                key={r.text}
                className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3"
              >
                <span className="text-2xl shrink-0" aria-hidden>
                  {r.emoji}
                </span>
                <p className="text-sm leading-relaxed text-paper-100/90">{r.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* The gift itself */}
      <section className="relative px-5 py-14 max-w-lg mx-auto text-center">
        <div className="h-px bg-brass-400/30 mb-8" />
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-paper-100/50 mb-5">
          And now… the gift 🎁
        </p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/scan')}
          className="w-full sm:w-72 mx-auto py-8 rounded-2xl bg-gradient-to-br from-[#FF3D9A] to-[#7C3AED] text-white shadow-[0_20px_50px_-15px_rgba(255,61,154,0.5)] flex flex-col items-center gap-2"
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