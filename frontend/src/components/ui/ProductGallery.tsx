import { useEffect, useRef, useState } from "react";
import { resolveMediaUrl } from "../../api/client";

interface Props {
  images: string[];
  alt: string;
}

/** Distance a finger must travel before it counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 40;

function Placeholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center !text-[#6B7A99]">
      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="text-sm">Şəkil mövcud deyil</span>
    </div>
  );
}

export default function ProductGallery({ images, alt }: Props) {
  const gallery = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  // Moving to another product hands us a different gallery; start it at the
  // front rather than wherever the previous one happened to be left.
  const key = gallery.join("|");
  useEffect(() => {
    setIndex(0);
  }, [key]);

  if (gallery.length === 0) {
    return (
      <div className="aspect-square lg:aspect-auto lg:h-full bg-[#F0F4FE]">
        <Placeholder />
      </div>
    );
  }

  // An index can outlive the list it points into for one render after the
  // gallery shrinks, so clamp rather than read past the end.
  const current = Math.min(index, gallery.length - 1);
  const multiple = gallery.length > 1;

  const go = (delta: number) =>
    setIndex((value) => {
      const safe = Math.min(value, gallery.length - 1);
      return (safe + delta + gallery.length) % gallery.length;
    });

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null || !multiple) return;
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    // Dragging leftwards pulls the next picture in, as it does everywhere else.
    go(delta < 0 ? 1 : -1);
  };

  const arrowClasses =
    "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center !text-[#1A2540] hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3B6FE0] transition-all duration-200";

  return (
    <div className="flex flex-col">
      {/* Main image */}
      <div
        role="group"
        aria-roledescription="karusel"
        aria-label={`${alt} şəkilləri`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (!multiple) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            go(1);
          }
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={onTouchEnd}
        className="relative aspect-square bg-[#F0F4FE] overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#3B6FE0]"
      >
        {failed[gallery[current]] ? (
          <Placeholder />
        ) : (
          <img
            src={resolveMediaUrl(gallery[current])}
            alt={multiple ? `${alt} — şəkil ${current + 1}/${gallery.length}` : alt}
            onError={() => setFailed((prev) => ({ ...prev, [gallery[current]]: true }))}
            className="w-full h-full object-cover"
          />
        )}

        {multiple && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Əvvəlki şəkil"
              className={`${arrowClasses} left-3`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Növbəti şəkil"
              className={`${arrowClasses} right-3`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Position readout, for when the thumbnails scroll out of sight */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-[#1A2540]/70 text-white text-xs font-medium tabular-nums">
              {current + 1} / {gallery.length}
            </div>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {gallery.map((image, position) => (
                <button
                  key={`${image}-${position}`}
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={`${position + 1}-ci şəklə keç`}
                  aria-current={position === current}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    position === current ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {multiple && (
        <div className="flex gap-2.5 p-4 overflow-x-auto">
          {gallery.map((image, position) => (
            <button
              key={`${image}-thumb-${position}`}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`${position + 1}-ci şəklə keç`}
              aria-current={position === current}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                position === current
                  ? "border-[#3B6FE0] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {failed[image] ? (
                <div className="w-full h-full bg-[#F0F4FE]" />
              ) : (
                <img
                  src={resolveMediaUrl(image)}
                  alt=""
                  loading="lazy"
                  onError={() => setFailed((prev) => ({ ...prev, [image]: true }))}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
