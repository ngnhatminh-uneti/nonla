'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBox from './SearchBox'; 
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Không hiển thị Header ở trang quản trị
  if (pathname.includes('/admin')) return null;

  // Danh sách các menu
  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Phim bộ', path: '/danh-sach/phim-bo' },
    { name: 'Phim lẻ', path: '/danh-sach/phim-le' },
    { name: 'Chiếu rạp', path: '/danh-sach/phim-chieu-rap' },
    { name: 'Hoạt hình', path: '/danh-sach/hoat-hinh' },
  ];

  return (
    <header className={`fixed top-0 w-full z-[1000] transition-colors duration-300 px-4 md:px-10 py-4 flex justify-between items-center ${isScrolled ? 'bg-[#141414] shadow-[0_2px_15px_rgba(0,0,0,0.8)]' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
      
      <div className="flex items-center gap-8 md:gap-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-2xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#d9a94d] to-[#b23838]">
            NÓN LÁ
          </span>
        </Link>
        
        {/* Thanh Menu Nằm Ngang */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            // Kiểm tra xem menu nào đang được chọn
            const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            
            return (
              <Link 
                key={link.name} 
                href={link.path}
                className={`font-bold text-[14px] transition-colors tracking-wide ${isActive ? 'text-[#d9a94d]' : 'text-[#ab9985] hover:text-white'}`}
              >
                {link.name}
              </Link>
            );
          })}
          
          {/* Nút Thể Loại (Có hiệu ứng thả menu nhẹ nhàng) */}
          <div className="group relative pb-2 -mb-2">
            <div className="text-[#ab9985] hover:text-white cursor-pointer transition-colors font-bold text-[14px] flex items-center tracking-wide">
              Thể loại
            </div>
            {/* Box chứa danh sách thể loại */}
            <div className="absolute top-full left-0 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
              <div className="bg-[#1d130f] border border-[#34241b] rounded-lg shadow-xl p-4 w-[350px] grid grid-cols-2 gap-3 mt-1">
                 <Link href="/danh-sach/hanh-dong" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] font-semibold">Hành Động</Link>
                 <Link href="/danh-sach/kinh-di" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] font-semibold">Kinh Dị</Link>
                 <Link href="/danh-sach/co-trang" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] font-semibold">Cổ Trang</Link>
                 <Link href="/danh-sach/gia-dinh" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] font-semibold">Gia Đình</Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
      
      <div className="flex items-center gap-5">
        {/* Ô Tìm Kiếm - Bo tròn nền đen */}
        <div className="relative hidden md:flex items-center">
          {/* THAY BẰNG SEARCH BOX ĐỘNG */}
           <SearchBox />
        </div>
        
        {/* Nút Tải App - Màu Đỏ */}
        <button className="bg-[#b23838] hover:bg-[#d94444] text-white px-6 py-2 rounded-full text-[13px] font-bold shadow-[0_4px_10px_rgba(178,56,56,0.3)] transition-all hover:scale-105">
          Tải App
        </button>
      </div>
    </header>
  );
}