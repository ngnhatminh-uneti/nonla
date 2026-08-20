'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MovieRowSlider({ title, movies }) {
  const sliderRef = useRef(null);
  if (!movies?.length) return null;

  const slide = (direction) => {
    const node = sliderRef.current;
    if (!node) return;
    node.scrollBy({ left: direction === 'left' ? -node.clientWidth * 0.8 : node.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="group/row relative" aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.65rem] tracking-wide text-[#d9a94d] md:text-[1.8rem]">{title}</h2>
          <span className="mt-1 block h-[2px] w-12 rounded-full bg-[#d9a94d]" />
        </div>
        <div className="hidden gap-2 md:flex">
          <button type="button" aria-label="Cuộn sang trái" onClick={() => slide('left')} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.04] text-white transition hover:border-[#d9a94d]/40 hover:bg-[#d9a94d] hover:text-[#160e08]">‹</button>
          <button type="button" aria-label="Cuộn sang phải" onClick={() => slide('right')} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.04] text-white transition hover:border-[#d9a94d]/40 hover:bg-[#d9a94d] hover:text-[#160e08]">›</button>
        </div>
      </div>

      <div ref={sliderRef} className="flex snap-x gap-3 overflow-x-auto scroll-smooth pb-4 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {movies.map((movie, index) => (
          <Link href={`/watch/${movie.slug}`} key={movie.slug || index} className="group/card w-[138px] shrink-0 snap-start sm:w-[150px] md:w-[160px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[.08] bg-[#21150f] shadow-lg transition duration-300 group-hover/card:-translate-y-1.5 group-hover/card:border-[#d9a94d]/60 group-hover/card:shadow-[0_18px_35px_rgba(0,0,0,.4)]">
              <Image src={movie.poster} alt={movie.title} fill sizes="160px" className="object-cover transition duration-500 group-hover/card:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />
              <div className="absolute left-2 top-2 flex gap-1">
                <span className="rounded bg-black/60 px-1.5 py-1 text-[9px] font-extrabold text-[#f3ead9] backdrop-blur">{movie.quality || 'HD'}</span>
              </div>
              {movie.episodes && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#b23838]/95 px-2 py-1 text-[9px] font-extrabold text-white shadow-lg">{movie.episodes}</span>}
              <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover/card:opacity-100">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#d9a94d] pl-0.5 text-[#160e08] shadow-[0_0_30px_rgba(217,169,77,.35)]">▶</span>
              </span>
            </div>
            <h3 className="mt-2.5 truncate text-[13px] font-bold text-[#f3ead9] transition group-hover/card:text-[#d9a94d]">{movie.title}</h3>
            <p className="mt-0.5 truncate text-[11px] text-[#6e5c4c]">{movie.originalTitle || movie.year || ''}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
