'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSlider({ movies }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 7000); 
    return () => clearInterval(interval);
  }, [movies]);

  const changeSlide = (dir) => {
    setCurrentSlide((prev) => (prev + dir + movies.length) % movies.length);
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 40) changeSlide(1);
    if (touchStart - touchEnd < -40) changeSlide(-1);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div 
      className="relative h-[85vh] w-full overflow-hidden group touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full relative">
        {movies.map((movie, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full flex items-center px-[4%] transition-opacity duration-[1200ms] ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img 
                src={movie.backdrop} 
                alt={movie.title} 
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#141414_0%,transparent_80%)] z-[1]"></div>
              <div className="absolute bottom-0 inset-x-0 h-[40vh] bg-[linear-gradient(0deg,#141414_0%,transparent_100%)] z-[1]"></div>

              <div className={`relative z-[3] max-w-[600px] transition-all duration-1000 ease-out delay-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-[30px] opacity-0'}`}>
                <h1 className="text-[11vw] md:text-[4.8vw] font-black text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] mb-[15px] leading-[1.1]">
                  {movie.title}
                </h1>
                <p className="text-[4.8vw] md:text-[1.2vw] text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] mb-[20px] line-clamp-3">
                  {movie.originalTitle || ''} ({movie.year || 'New'}) - Nội dung chất lượng cao đang chờ đón bạn. Hãy xem ngay trên NÓN LÁ!
                </p>
                
                <div className="flex flex-wrap gap-y-2">
                  <Link href={`/watch/${movie.slug}`} className="bg-white text-black px-[25px] py-[10px] text-[1.1rem] rounded-[4px] font-bold inline-flex items-center gap-[10px] transition-all duration-300 hover:bg-white/70 hover:scale-105 mr-[10px]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Phát Ngay
                  </Link>
                  <Link href={`/watch/${movie.slug}`} className="bg-[#6d6d6e]/70 text-white px-[25px] py-[10px] text-[1.1rem] rounded-[4px] font-bold inline-flex items-center gap-[10px] transition-all duration-300 hover:bg-[#6d6d6e]/40 hover:scale-105">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg> Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="absolute top-[45%] left-[2%] -translate-y-1/2 bg-black/50 text-white w-[50px] h-[50px] rounded-full text-[20px] z-[10] flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20 hover:bg-[#e50914]/80 hover:scale-110 hover:border-[#e50914] hidden md:flex" onClick={() => changeSlide(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button className="absolute top-[45%] right-[2%] -translate-y-1/2 bg-black/50 text-white w-[50px] h-[50px] rounded-full text-[20px] z-[10] flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20 hover:bg-[#e50914]/80 hover:scale-110 hover:border-[#e50914] hidden md:flex" onClick={() => changeSlide(1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* ĐÃ FIX: Nhấc các dấu chấm lên bottom-[120px] để không bị Thể loại đè lên */}
      <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 flex gap-[8px] z-[10]">
        {movies.map((_, idx) => (
          <div key={idx} onClick={() => setCurrentSlide(idx)} className={`h-[4px] rounded-[2px] cursor-pointer transition-all duration-300 ${idx === currentSlide ? 'bg-[#e50914] w-[40px] shadow-[0_0_10px_rgba(229,9,20,0.8)]' : 'bg-white/30 w-[25px] hover:bg-white/80'}`}></div>
        ))}
      </div>
    </div>
  );
}