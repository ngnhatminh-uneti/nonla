'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function SearchBox() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Xử lý ẩn popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Thuật toán Debounce: Đợi người dùng ngừng gõ 300ms mới gọi API để tránh lag
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Gọi API tìm kiếm của KKPhim trước
        let res = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
        let json = await res.json();
        let items = json?.data?.items || json?.items || [];
        let cdnDomain = json?.data?.APP_DOMAIN_CDN_IMAGE || json?.pathImage || 'https://phimimg.com';

        // Nếu KKPhim không có, thử gọi tiếp NguồnC
        if (items.length === 0) {
          const resNguon = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword)}`);
          const dataNguon = await resNguon.json();
          items = dataNguon?.items || [];
          
          setResults(items.slice(0, 5).map(m => ({
            title: m.name,
            originalTitle: m.original_name || m.origin_name || '',
            slug: m.slug,
            poster: m.poster_url || m.thumb_url,
            year: m.year || 'Mới',
            episodes: m.episode_current || 'Tập mới'
          })));
        } else {
          setResults(items.slice(0, 5).map(m => {
            const getImg = (path) => path?.startsWith('http') ? path : `${cdnDomain.endsWith('/') ? cdnDomain.slice(0, -1) : cdnDomain}/${path?.startsWith('/') ? path.slice(1) : path}`;
            return {
              title: m.name || m.title,
              originalTitle: m.origin_name || m.original_title || '',
              slug: m.slug,
              poster: getImg(m.poster_url) || getImg(m.thumb_url),
              year: m.year || 'Mới',
              episodes: m.episode_current || 'Tập mới'
            };
          }));
        }
        setIsOpen(true);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

return (
    <div className="relative w-full max-w-[280px] md:max-w-[320px]" ref={searchRef} suppressHydrationWarning>
      {/* Ô Input Nhập Từ Khóa */}
      <div className="relative flex items-center" suppressHydrationWarning>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Tìm phim, diễn viên..."
          className="w-full bg-[#1a1412] border border-[#34241b] rounded-full py-1.5 pl-4 pr-10 text-[13px] text-white outline-none focus:border-[#d9a94d] transition-colors placeholder:text-[#6e5c4c]"
        />
        <span className="absolute right-3.5 text-[#6e5c4c] pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-[#d9a94d] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
          )}
        </span>
      </div>

      {/* Popup Gợi Ý Trực Tuyến (Live Dropdown) */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#19110e] border border-[#34241b] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden z-[9999]">
          <div className="p-2 border-b border-[#34241b] text-[11px] font-bold text-[#ab9985] uppercase tracking-wider px-3">
            Gợi ý tìm kiếm
          </div>
          <div className="flex flex-col max-h-[380px] overflow-y-auto custom-scrollbar">
            {results.map((m, idx) => (
              <Link
                href={`/watch/${m.slug}`}
                key={idx}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2.5 hover:bg-[#241a14] transition-colors border-b border-[#34241b]/50 last:border-0 group"
              >
                <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded border border-[#34241b] shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-bold text-white truncate group-hover:text-[#d9a94d] transition-colors">
                    {m.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#6e5c4c] mt-0.5">
                    <span>{m.year}</span>
                    <span>•</span>
                    <span className="text-[#38ef7d] font-semibold">{m.episodes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}