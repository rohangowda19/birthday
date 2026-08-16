// Placeholder photo tile for the gift-reveal flow. Swap the `src` prop with
// a real photo path (e.g. "/gift/memory1.jpg" — drop files in client/public/gift/)
// once you have actual photos; until then it renders a warm gradient card
// so the layout looks intentional rather than broken.
const GRADIENTS = [
  'from-[#FF8C69] to-[#E8532F]',
  'from-[#FFD08A] to-[#FF8C69]',
  'from-[#F4A896] to-[#C2604D]',
  'from-[#FFC96B] to-[#E8532F]',
  'from-[#FF9B85] to-[#B14A3B]',
];

interface Props {
  caption: string;
  emoji?: string;
  src?: string;
  gradientIndex?: number;
  className?: string;
}

export default function PhotoTile({ caption, emoji, src, gradientIndex = 0, className = '' }: Props) {
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];

  return (
    <div className={`relative overflow-hidden rounded-2xl aspect-[4/5] ${className}`}>
      {src ? (
        <img src={src} alt={caption} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {emoji && <span className="text-5xl opacity-90">{emoji}</span>}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
      <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium leading-snug">
        {caption}
      </p>
    </div>
  );
}