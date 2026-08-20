import Link from 'next/link';

const genreLinks = [
  ['Hành động', 'hanh-dong'],
  ['Tình cảm', 'tinh-cam'],
  ['Kinh dị', 'kinh-di'],
  ['Hài hước', 'hai-huoc'],
  ['Cổ trang', 'co-trang'],
  ['Tâm lý', 'tam-ly'],
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/[.07] bg-[#0e0907]">
      <div className="mx-auto max-w-[1600px] px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="font-display text-3xl tracking-[.12em] text-[#d9a94d]">NÓN LÁ</Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#897666]">
              Không gian xem phim trực tuyến với giao diện điện ảnh, tối ưu cho desktop và mobile.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">Khám phá</h2>
            <div className="space-y-3 text-sm text-[#897666]">
              <Link className="block transition hover:text-[#d9a94d]" href="/danh-sach/phim-bo">Phim bộ mới nhất</Link>
              <Link className="block transition hover:text-[#d9a94d]" href="/danh-sach/phim-le">Phim lẻ</Link>
              <Link className="block transition hover:text-[#d9a94d]" href="/danh-sach/phim-chieu-rap">Chiếu rạp</Link>
              <Link className="block transition hover:text-[#d9a94d]" href="/danh-sach/hoat-hinh">Anime</Link>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">Thể loại</h2>
            <div className="flex flex-wrap gap-2">
              {genreLinks.map(([name, slug]) => (
                <Link key={slug} href={`/danh-sach/${slug}`} className="rounded-full border border-white/[.08] bg-white/[.03] px-3 py-1.5 text-[11px] font-semibold text-[#897666] transition hover:border-[#d9a94d]/40 hover:bg-[#d9a94d]/10 hover:text-[#d9a94d]">
                  {name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">Thông tin</h2>
            <div className="space-y-3 text-sm text-[#897666]">
              <Link className="block transition hover:text-[#d9a94d]" href="/">Giới thiệu</Link>
              <Link className="block transition hover:text-[#d9a94d]" href="/">Điều khoản sử dụng</Link>
              <Link className="block transition hover:text-[#d9a94d]" href="/">Chính sách bảo mật</Link>
              <Link className="block transition hover:text-[#d9a94d]" href="/">Liên hệ</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[.06] pt-6 text-xs text-[#625244] md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} NÓN LÁ. All rights reserved.</p>
          <p>Thiết kế cho trải nghiệm xem phim nhanh, rõ ràng và dễ sử dụng.</p>
        </div>
      </div>
    </footer>
  );
}
