import Link from 'next/link';

export const revalidate = 0;

// THUẬT TOÁN GỌI API DANH SÁCH
async function getFilteredMovies(slug, page = 1) {
  const nguonCEndpoints = [
    `https://phim.nguonc.com/api/films/the-loai/${slug}?page=${page}`,
    `https://phim.nguonc.com/api/films/quoc-gia/${slug}?page=${page}`,
    `https://phim.nguonc.com/api/films/danh-sach/${slug}?page=${page}`
  ];

  for (let url of nguonCEndpoints) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.items?.length > 0) {
          return {
            title: data?.paginate?.title || data?.seoOnPage?.titleHead || slug,
            items: data.items.map(m => ({
              title: m.name,
              originalTitle: m.original_name || m.origin_name || '',
              slug: m.slug,
              poster: m.poster_url || m.thumb_url,
              year: m.year || 'Đang cập nhật',
              quality: m.quality || 'HD',
              episodes: m.episode_current || 'Tập mới',
            })),
            pagination: data.paginate || {}
          };
        }
      }
    } catch (e) {}
  }

  const kkEndpoints = [
    `https://phimapi.com/v1/api/the-loai/${slug}?page=${page}`,
    `https://phimapi.com/v1/api/quoc-gia/${slug}?page=${page}`,
    `https://phimapi.com/v1/api/danh-sach/${slug}?page=${page}`
  ];

  for (let url of kkEndpoints) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.items?.length > 0) {
          const cdnDomain = data?.data?.APP_DOMAIN_CDN_IMAGE || data?.pathImage || 'https://phimimg.com';
          const getImg = (path) => path?.startsWith('http') ? path : `${cdnDomain.endsWith('/') ? cdnDomain.slice(0, -1) : cdnDomain}/${path?.startsWith('/') ? path.slice(1) : path}`;

          return {
            title: data.data.seoOnPage?.titleHead || data.data.titlePage || slug,
            items: data.data.items.map(m => ({
              title: m.name,
              originalTitle: m.origin_name || m.original_title || '',
              slug: m.slug,
              poster: getImg(m.poster_url) || getImg(m.thumb_url),
              year: m.year || 'Đang cập nhật',
              quality: m.quality || 'HD',
              episodes: m.episode_current || 'Tập mới',
            })),
            pagination: data.data.params?.pagination || {}
          };
        }
      }
    } catch (e) {}
  }
  return null;
}

// HÀM LẤY PHIM ĐỀ CỬ CHO CỘT BÊN PHẢI
async function getSidebarMovies() {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/home`, { cache: 'no-store' });
    const json = await res.json();
    const items = json?.data?.items || json?.items || [];
    const cdnDomain = json?.data?.APP_DOMAIN_CDN_IMAGE || json?.pathImage || 'https://phimimg.com';

    return items.slice(5, 15).map(m => {
      const getImg = (path) => path?.startsWith('http') ? path : `${cdnDomain.endsWith('/') ? cdnDomain.slice(0, -1) : cdnDomain}/${path?.startsWith('/') ? path.slice(1) : path}`;
      return {
        title: m.name || m.title,
        originalTitle: m.origin_name || m.original_title || '',
        slug: m.slug,
        poster: getImg(m.poster_url),
        year: m.year || 'Mới',
        episodes: m.episode_current || 'Tập mới',
      };
    });
  } catch (error) {
    return [];
  }
}

// COMPONENT BẢNG XẾP HẠNG / ĐỀ CỬ BÊN PHẢI
const SidebarRanking = ({ title, movies }) => (
  <div className="bg-[#1d130f] border border-[#34241b] rounded-xl p-5 mb-6">
    <h3 className="font-display text-[1.3rem] tracking-wide text-[#d9a94d] border-b border-[#34241b] pb-3 mb-4 flex items-center justify-between">
      <span>{title}</span>
    </h3>
    <div className="flex flex-col">
      {movies.map((m, idx) => (
        <Link href={`/watch/${m.slug}`} key={idx} className="flex items-center gap-3 py-3 border-b border-[#34241b] last:border-0 group cursor-pointer">
          <div className={`shrink-0 w-8 h-8 rounded flex items-center justify-center font-display text-[18px] shadow-sm ${idx < 3 ? 'bg-[#d9a94d] text-[#1d130a]' : 'bg-[#241a14] border border-[#34241b] text-[#ab9985]'}`}>
            {idx + 1}
          </div>
          <img src={m.poster} className="w-12 h-16 object-cover rounded shadow-md border border-[#34241b]" alt={m.title} />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold text-[#f3ead9] group-hover:text-[#d9a94d] transition-colors truncate mb-1">{m.title}</div>
            <div className="flex items-center gap-2 text-[11px] text-[#6e5c4c] font-semibold">
              <span className="text-[#d9a94d]">★ 8.{Math.floor(Math.random() * 9)}</span>
              <span>•</span>
              <span className="truncate">{m.originalTitle || m.year}</span>
            </div>
            <div className="text-[11px] text-[#b23838] font-bold mt-1">{m.episodes}</div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);


// GIAO DIỆN CHÍNH (SERVER COMPONENT)
export default async function ListPage({ params, searchParams }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const resolvedSearch = await searchParams;
  const page = parseInt(resolvedSearch?.page || '1');

  const [data, sidebarMovies] = await Promise.all([
    getFilteredMovies(slug, page),
    getSidebarMovies()
  ]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center pt-20">
        <h1 className="text-2xl font-display mb-4 text-[#b23838]">Rất tiếc, danh mục này chưa có phim!</h1>
        <Link href="/" className="bg-[#d9a94d] text-[#1d130a] font-bold px-6 py-3 rounded hover:scale-105 transition">
          Quay Về Trang Chủ
        </Link>
      </div>
    );
  }

  const totalPages = data.pagination?.totalPages || data.pagination?.total_pages || 100;

  return (
    <main className="min-h-screen bg-[#110d0f] px-4 md:px-10 py-[90px] flex-grow w-full font-sans">
      <div className="max-w-[1500px] mx-auto">
        
        {/* Tiêu đề Trang */}
        <h1 className="text-[1.8rem] font-bold text-[#f3ead9] mb-8 border-b border-[#34241b] pb-4">{data.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 items-start">
          
          <div className="min-w-0">
            {/* LƯỚI PHIM 5 CỘT - CẬP NHẬT CHUẨN UI TRANG CHỦ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
              {data.items.slice(0, 15).map((m) => (
                <Link href={`/watch/${m.slug}`} key={m.slug} className="group block">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden border border-[#34241b] bg-[#241a14] relative transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-[#d9a94d] shadow-md">
                    
                    {/* Ảnh Poster mờ đi chút khi hover để nổi bật nút Play */}
                    <img src={m.poster} className="w-full h-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-70" alt={m.title} />
                    
                    {/* Badge chất lượng (Góc trái trên: Nền tối, chữ vàng) */}
                    <span className="absolute top-2 left-2 bg-[#1a1412]/90 border border-[#34241b] text-[#d9a94d] text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm z-10 backdrop-blur-sm">
                      {m.quality}
                    </span>
                    
                    {/* Badge tập phim (Nằm giữa cạnh dưới: Nền đỏ sẫm, chữ trắng) */}
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-[#7c2020]/95 text-white text-[11px] font-bold px-3 py-1 rounded shadow-lg z-10 truncate backdrop-blur-sm border border-white/10">
                      {m.episodes}
                    </span>

                    {/* Lớp nền và Nút Play đỏ mượt mà khi hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                      <div className="w-14 h-14 bg-[#b23838] rounded-full flex items-center justify-center text-white pl-1 shadow-[0_0_20px_rgba(178,56,56,0.5)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Thông tin Text - Căn TRÁI, chữ đổi màu VÀNG khi hover */}
                  <div className="mt-3 text-left">
                    <h4 className="text-[14.5px] font-bold text-[#f3ead9] truncate group-hover:text-[#d9a94d] transition-colors leading-tight mb-0.5">{m.title}</h4>
                    <p className="text-[12.5px] text-[#6e5c4c] truncate">{m.originalTitle || m.year}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* ĐIỀU HƯỚNG PHÂN TRANG */}
            <div className="flex items-center justify-center gap-4 mt-12 mb-8">
              {page > 1 ? (
                <Link href={`?page=${page - 1}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1c1624] text-[#ab9985] hover:text-white hover:bg-[#2a2235] transition-colors border border-[#34241b]">❮</Link>
              ) : (
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1c1624] text-[#4d4036] border border-[#34241b] cursor-not-allowed">❮</div>
              )}
              
              <div className="flex items-center gap-2 text-[#ab9985] text-[14px] font-semibold">
                Trang 
                <input type="text" readOnly value={page} className="w-12 h-8 bg-[#1c1624] border border-[#34241b] rounded text-center text-white outline-none shadow-inner" /> 
                / {totalPages}
              </div>

              {page < totalPages ? (
                <Link href={`?page=${page + 1}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1c1624] text-[#ab9985] hover:text-white hover:bg-[#2a2235] transition-colors border border-[#34241b]">❯</Link>
              ) : (
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1c1624] text-[#4d4036] border border-[#34241b] cursor-not-allowed">❯</div>
              )}
            </div>
          </div>

          <aside className="sticky top-[90px] flex flex-col">
            <SidebarRanking title="Nón Lá Đề Cử" movies={sidebarMovies} />
          </aside>

        </div>
      </div>
    </main>
  );
}