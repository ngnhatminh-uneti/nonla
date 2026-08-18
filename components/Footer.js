import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#110d0f] border-t border-[#34241b] pt-12 pb-6 mt-auto">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block w-fit">
              <span className="font-display text-2xl font-black text-[#d9a94d] tracking-widest uppercase">
                NÓN LÁ
              </span>
            </Link>
            <p className="text-[#ab9985] text-[13px] leading-relaxed pr-4">
              Nón Lá là nền tảng xem phim trực tuyến miễn phí chất lượng cao, cung cấp hàng ngàn bộ phim bom tấn, phim bộ, anime và TV shows mới nhất với tốc độ nhanh và không chứa quảng cáo độc hại.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-[#241a14] border border-[#34241b] flex items-center justify-center text-[#d9a94d] hover:bg-[#d9a94d] hover:text-[#1d130a] transition-colors">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#241a14] border border-[#34241b] flex items-center justify-center text-[#d9a94d] hover:bg-[#d9a94d] hover:text-[#1d130a] transition-colors">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
              </a>
            </div>
          </div>

          {/* CỘT 2: QUY ĐỊNH & HỖ TRỢ */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-[15px] mb-2">Quy Định & Hỗ Trợ</h4>
            <Link href="#" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Giới thiệu về Nón Lá</Link>
            <Link href="#" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Điều khoản sử dụng</Link>
            <Link href="#" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Chính sách bảo mật (Privacy Policy)</Link>
            <Link href="#" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Khiếu nại bản quyền (DMCA)</Link>
            <Link href="#" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Liên hệ quảng cáo</Link>
          </div>

          {/* CỘT 3: DANH MỤC PHIM */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-[15px] mb-2">Danh Mục Phim</h4>
            <Link href="/danh-sach/phim-bo" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Phim Bộ Mới Nhất</Link>
            <Link href="/danh-sach/phim-le" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Phim Lẻ Chiếu Rạp</Link>
            <Link href="/danh-sach/hoat-hinh" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Phim Hoạt Hình (Anime)</Link>
            <Link href="/danh-sach/han-quoc" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Phim Hàn Quốc</Link>
            <Link href="/danh-sach/trung-quoc" className="text-[#ab9985] hover:text-[#d9a94d] text-[13px] transition-colors w-fit">Phim Trung Quốc</Link>
          </div>

          {/* CỘT 4: THỂ LOẠI NỔI BẬT */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-[15px] mb-2">Thể Loại Nổi Bật</h4>
            <div className="flex flex-wrap gap-2">
              {['Hành Động', 'Tình Cảm', 'Kinh Dị', 'Hài Hước', 'Viễn Tưởng', 'Cổ Trang', 'Tâm Lý'].map((genre, i) => (
                <Link 
                  key={i}
                  href={`/danh-sach/${genre.toLowerCase().replace(/ /g, '-')}`}
                  className="bg-[#241a14] border border-[#34241b] text-[#ab9985] text-[11px] px-2.5 py-1 rounded hover:bg-[#d9a94d] hover:text-[#1d130a] transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* DÒNG BẢN QUYỀN CUỐI CÙNG */}
        <div className="pt-6 border-t border-[#241a14] flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#6e5c4c]">
          <p>© {currentYear} NÓN LÁ. All rights reserved.</p>
          <p>This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
        </div>

      </div>
    </footer>
  );
}