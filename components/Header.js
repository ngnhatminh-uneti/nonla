'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBox from './SearchBox';

const navLinks = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Phim bộ', path: '/danh-sach/phim-bo' },
  { name: 'Phim lẻ', path: '/danh-sach/phim-le' },
  { name: 'Chiếu rạp', path: '/danh-sach/phim-chieu-rap' },
  { name: 'Hoạt hình', path: '/danh-sach/hoat-hinh' },
];

const genres = [
  ['Hành động', 'hanh-dong'],
  ['Kinh dị', 'kinh-di'],
  ['Cổ trang', 'co-trang'],
  ['Gia đình', 'gia-dinh'],
  ['Hàn Quốc', 'han-quoc'],
  ['Trung Quốc', 'trung-quoc'],
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname.includes('/admin')) return null;

  const isActive = (path) => path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <header className={`fixed inset-x-0 top-0 z-[1000] transition-all duration-300 ${
      isScrolled
        ? 'bg-[#120b09]/90 border-b border-white/10 shadow-[0_12px_40px_rgba(0,0,0,.35)] backdrop-blur-xl'
        : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
    }`}>
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-5 xl:gap-10">
          <Link href="/" aria-label="Nón Lá - Trang chủ" className="group shrink-0">
            <span className="font-display text-[28px] leading-none tracking-[.12em] text-[#f3ead9] transition group-hover:text-[#d9a94d]">
              NÓN LÁ
            </span>
            <span className="ml-2 hidden text-[9px] font-bold uppercase tracking-[.28em] text-[#8e765f] sm:inline">Cinema</span>
          </Link>

          <nav aria-label="Điều hướng chính" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative rounded-full px-3 py-2 text-[13px] font-bold transition ${
                  isActive(link.path)
                    ? 'bg-white/[.08] text-[#f3ead9]'
                    : 'text-[#ab9985] hover:bg-white/[.05] hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.path) && <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-[#d9a94d]" />}
              </Link>
            ))}

            <div className="group relative">
              <button type="button" className="rounded-full px-3 py-2 text-[13px] font-bold text-[#ab9985] transition hover:bg-white/[.05] hover:text-white">
                Thể loại <span className="ml-1 text-[10px]">▾</span>
              </button>
              <div className="pointer-events-none absolute left-0 top-full w-[360px] translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-[#1a100c]/95 p-3 shadow-2xl backdrop-blur-xl">
                  {genres.map(([name, slug]) => (
                    <Link key={slug} href={`/danh-sach/${slug}`} className="rounded-xl px-3 py-3 text-[13px] font-semibold text-[#bda996] transition hover:bg-white/[.06] hover:text-[#d9a94d]">
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden md:block w-[220px] lg:w-[280px]"><SearchBox /></div>
          <button type="button" className="hidden sm:inline-flex h-10 items-center rounded-full bg-[#b23838] px-5 text-[12px] font-extrabold text-white shadow-[0_8px_25px_rgba(178,56,56,.22)] transition hover:-translate-y-0.5 hover:bg-[#c94a4a]">
            Tải App
          </button>
          <button
            type="button"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[.05] text-white lg:hidden"
          >
            <span className="text-lg">{menuOpen ? '×' : '☰'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#120b09]/98 px-4 pb-5 pt-3 shadow-2xl backdrop-blur-xl lg:hidden">
          <nav className="mx-auto max-w-[1600px] space-y-1" aria-label="Menu mobile">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path} className={`block rounded-xl px-4 py-3 text-sm font-bold ${isActive(link.path) ? 'bg-[#d9a94d]/10 text-[#d9a94d]' : 'text-[#bda996]'}`}>
                {link.name}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-1 pt-2">
              {genres.map(([name, slug]) => (
                <Link key={slug} href={`/danh-sach/${slug}`} className="rounded-xl px-4 py-3 text-xs font-semibold text-[#8f7b69] hover:bg-white/[.04] hover:text-white">
                  {name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
