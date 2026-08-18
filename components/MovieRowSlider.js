'use client';
import { useRef } from 'react';
import Link from 'next/link';

export default function MovieRowSlider({ title, movies }) {
  const sliderRef = useRef(null);

  const slide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -sliderRef.current.offsetWidth / 1.5 : sliderRef.current.offsetWidth / 1.5;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative group">
      {/* 1. Tiêu đề */}
      <h3 className="font-display text-[1.7rem] text-[#d9a94d] relative pb-2 mb-6 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[3px] after:bg-[#d9a94d] after:rounded-full">
        {title}
      </h3>

      <div className="relative">
        {/* Nút Trượt Trái */}
        <button 
          onClick={() => slide('left')} 
          className="absolute left-0 top-[40%] -translate-y-1/2 -ml-5 bg-black/80 text-white w-[45px] h-[45px] rounded-full text-[20px] z-[20] flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20 hover:bg-[#d9a94d] hover:scale-110 hover:border-[#d9a94d] hidden md:flex backdrop-blur-sm"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        {/* 2. Dải cuộn phim (ĐÃ FIX: Thêm pt-3 để có không gian cho ảnh trồi lên không bị cắt) */}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pt-3 pb-4 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {movies.map((m) => (
            <Link href={`/watch/${m.slug}`} key={m.slug} className="shrink-0 w-[140px] md:w-[160px] snap-start group/card block">
              <div className="aspect-[2/3] rounded-lg overflow-hidden border border-[#34241b] bg-[#241a14] relative transition-transform duration-300 group-hover/card:-translate-y-2 group-hover/card:border-[#d9a94d]">
                <img src={m.poster} className="w-full h-full object-cover opacity-90" alt={m.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <span className="absolute top-2 left-2 bg-[#0a0806]/80 text-[#d9a94d] text-[10px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-sm z-10">{m.quality}</span>
                <div className="absolute bottom-2 left-0 right-0 text-center z-10">
                   <span className="bg-[#b23838]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">{m.episodes}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 bg-[#0a0806]/40 transition-opacity z-10">
                  <div className="w-12 h-12 bg-[#b23838] rounded-full flex items-center justify-center text-white pl-1 shadow-[0_0_15px_rgba(178,56,56,0.5)]">▶</div>
                </div>
              </div>
              <div className="mt-2.5">
                <h4 className="text-[14px] font-bold text-[#f3ead9] truncate leading-tight group-hover/card:text-[#d9a94d] transition-colors">{m.title}</h4>
                <p className="text-[12px] text-[#6e5c4c] truncate">{m.originalTitle}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Nút Trượt Phải */}
        <button 
          onClick={() => slide('right')} 
          className="absolute right-0 top-[40%] -translate-y-1/2 -mr-5 bg-black/80 text-white w-[45px] h-[45px] rounded-full text-[20px] z-[20] flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20 hover:bg-[#d9a94d] hover:scale-110 hover:border-[#d9a94d] hidden md:flex backdrop-blur-sm"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </section>
  );
}