'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSlider({ movies }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    if (!movies?.length) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % movies.length), 7000);
    return () => clearInterval(interval);
  }, [movies?.length]);

  if (!movies?.length) return null;

  const changeSlide = (dir) => setCurrentSlide((prev) => (prev + dir + movies.length) % movies.length);
  const handleTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 40) changeSlide(distance > 0 ? 1 : -1);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section
      aria-label="Phim nổi bật"
      className="relative h-[72vh] min-h-[560px] max-h-[820px] w-full overflow-hidden bg-black md:h-[78vh]"
      onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
      onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
      onTouchEnd={handleTouchEnd}
    >
      {movies.map((movie, index) => {
        const active = index === currentSlide;
        return (
          <article key={movie.slug || index} aria-hidden={!active} className={`absolute inset-0 transition-opacity duration-700 ${active ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}>
            <Image
              src={movie.backdrop}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,5,4,.96)_0%,rgba(8,5,4,.72)_28%,rgba(8,5,4,.18)_70%,rgba(8,5,4,.2)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,#120b09_0%,rgba(18,11,9,.72)_16%,transparent_55%)]" />

            <div className={`absolute inset-x-0 bottom-[17%] z-20 px-5 transition-all duration-700 md:px-[7%] ${active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="max-w-2xl">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider">
                  <span className="rounded bg-[#d9a94d] px-2.5 py-1 text-[#160e08]">{movie.quality || 'HD'}</span>
                  <span className="rounded border border-white/20 bg-black/35 px-2.5 py-1 text-white backdrop-blur">{movie.lang || 'Vietsub'}</span>
                  <span className="text-[#d9c8b2]">{movie.year || 'Mới'}</span>
                </div>
                <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
                  {movie.title}
                </h1>
                {movie.originalTitle && <p className="mt-2 text-sm font-medium text-[#d5c5b4] md:text-base">{movie.originalTitle}</p>}
                <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-6 text-[#c5b7a8] md:text-[15px]">
                  Nội dung chất lượng cao đang chờ đón bạn. Hãy khám phá ngay trên NÓN LÁ.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/watch/${movie.slug}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f3ead9] px-6 text-sm font-extrabold text-[#160e08] shadow-xl transition hover:-translate-y-0.5 hover:bg-white">
                    <span aria-hidden="true">▶</span> Phát ngay
                  </Link>
                  <Link href={`/watch/${movie.slug}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-extrabold text-white backdrop-blur-md transition hover:bg-white/15">
                    Xem chi tiết <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      <button aria-label="Phim trước" onClick={() => changeSlide(-1)} className="absolute left-5 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-xl text-white backdrop-blur transition hover:bg-white/15 md:flex">‹</button>
      <button aria-label="Phim tiếp theo" onClick={() => changeSlide(1)} className="absolute right-5 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-xl text-white backdrop-blur transition hover:bg-white/15 md:flex">›</button>

      <div className="absolute bottom-7 left-5 z-30 flex items-center gap-2 md:left-[7%]" role="tablist" aria-label="Chọn phim nổi bật">
        {movies.map((movie, idx) => (
          <button
            key={movie.slug || idx}
            role="tab"
            aria-selected={idx === currentSlide}
            aria-label={`Phim ${idx + 1}: ${movie.title}`}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1 rounded-full transition-all ${idx === currentSlide ? 'w-10 bg-[#d9a94d]' : 'w-5 bg-white/35 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  );
}
