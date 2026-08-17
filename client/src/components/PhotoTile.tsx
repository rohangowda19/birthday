// Placeholder/media tile for the gift-reveal memory wall. Supports a real
// photo, a short looping video, or (until you add either) a warm gradient
// with an emoji so the layout still looks intentional.
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
  videoSrc?: string;
  gradientIndex?: number;
  className?: string;
}

export default function PhotoTile({
  caption,
  emoji,
  src,
  videoSrc,
  gradientIndex = 0,
  className = '',
}: Props) {
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];

  return (
    <div className={`relative overflow-hidden rounded-2xl aspect-[4/5] ${className}`}>
      {videoSrc ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={videoSrc}
          poster={src}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : src ? (
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