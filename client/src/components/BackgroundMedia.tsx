interface Props {
  imageSrc?: string;
  videoSrc?: string;
  /** Tailwind opacity class, e.g. "opacity-40". Defaults to fully opaque. */
  opacityClassName?: string;
  className?: string;
}

// Renders a video background if videoSrc is given, otherwise falls back to
// a static photo. If neither file exists yet, the gradient behind it in the
// parent page just shows through — nothing breaks either way.
export default function BackgroundMedia({
  imageSrc,
  videoSrc,
  opacityClassName = '',
  className = '',
}: Props) {
  if (videoSrc) {
    return (
      <video
        className={`absolute inset-0 w-full h-full object-cover ${opacityClassName} ${className}`}
        src={videoSrc}
        poster={imageSrc}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 bg-cover bg-center ${opacityClassName} ${className}`}
      style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}
    />
  );
}