import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import MovieRowSlider from '@/components/MovieRowSlider';

export const revalidate = 0;

// Lõi lấy API KKPhim
async function fetchKKPhimAPI(endpoint) {
  try {
    const res = await fetch(`https://phimapi.com${endpoint}`, { cache: 'no-store' });
    const json = await res.json();
    const items = json?.data?.items || json?.items || [];
    const cdnDomain = json?.data?.APP_DOMAIN_CDN_IMAGE || json?.pathImage || 'https://phimimg.com';

    return items.map(m => {
      const getImg = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        let domain = cdnDomain.endsWith('/') ? cdnDomain.slice(0, -1) : cdnDomain;
        let cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${domain}/${cleanPath}`;
      };

      const posterStr = getImg(m.poster_url);
      const thumbStr = getImg(m.thumb_url);

      return {
        title: m.name || m.title || 'Đang cập nhật',
        originalTitle: m.origin_name || m.original_title || '',
        slug: m.slug,
        poster: posterStr || 'https://via.placeholder.com/600x800?text=No+Poster',
        backdrop: thumbStr || posterStr || 'https://via.placeholder.com/1200x800?text=No+Background',
        year: m.year || 'Mới',
        quality: m.quality || 'HD',
        lang: m.lang || 'Vietsub', // THÊM DÒNG NÀY ĐỂ LẤY THÔNG TIN VIETSUB
        episodes: m.episode_current || 'Tập mới',
        description: m.content || m.description || 'Nội dung đang được cập nhật...'
      };
    });
  } catch (error) {
    return [];
  }
}

async function getHomepageData() {
  const [homeData, seriesData, singleData, cinemaData, animeData] = await Promise.all([
    fetchKKPhimAPI('/v1/api/home'),
    fetchKKPhimAPI('/v1/api/danh-sach/phim-bo?limit=10'),
    fetchKKPhimAPI('/v1/api/danh-sach/phim-le?limit=10'),
    fetchKKPhimAPI('/v1/api/danh-sach/phim-chieu-rap?limit=10'),
    fetchKKPhimAPI('/v1/api/danh-sach/hoat-hinh?limit=10')
  ]);

  return {
    hero: homeData.slice(0, 5),
    deCu: homeData.slice(5, 15),
    phimBo: seriesData,
    phimLe: singleData,
    chieuRap: cinemaData,
    anime: animeData
  };
}

const BentoGrid = ({ movies, isSeries }) => {
  if (!movies || movies.length === 0) return null;
  const feature = movies[0];
  const smalls = movies.slice(1, 9); 

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      
      {/* ẢNH LỚN */}
      <Link href={`/watch/${feature.slug}`} className="col-span-2 row-span-2 relative rounded-xl overflow-hidden bg-[#241a14] border border-[#34241b] group cursor-pointer block h-full min-h-[220px] md:min-h-[340px]">
        <img src={feature.backdrop} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={feature.title}/>
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
          <span className="bg-[#f5c518] text-black text-[11px] font-extrabold px-2 py-0.5 rounded">{feature.quality}</span>
          <span className="bg-black/60 text-white border border-white/20 text-[11px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">{feature.lang}</span>
        </div>
        {isSeries && <span className="absolute top-2.5 right-2.5 bg-[#b23838] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-md">{feature.episodes}</span>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none"></div>
        <div className="absolute left-4 right-4 bottom-4 z-10">
          <h3 className="text-xl md:text-[22px] font-extrabold text-white leading-tight mb-1 group-hover:text-[#d9a94d] transition-colors">{feature.title}</h3>
          <p className="text-[13px] md:text-[14px] text-[#ab9985] truncate">{feature.originalTitle}</p>
        </div>
      </Link>

      {/* 8 ẢNH NHỎ */}
      {smalls.map((m, i) => (
        <Link href={`/watch/${m.slug}`} key={i} className="col-span-1 row-span-1 relative rounded-xl overflow-hidden bg-[#241a14] border border-[#34241b] aspect-video group cursor-pointer block">
          <img src={m.backdrop} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={m.title}/>
          <div className="absolute top-2 left-2 flex gap-1 z-10">
            <span className="bg-[#f5c518] text-black text-[9px] md:text-[10px] font-extrabold px-1.5 py-0.5 rounded">{m.quality}</span>
            <span className="bg-black/60 text-white border border-white/20 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm truncate max-w-[75px] md:max-w-[90px]">{m.lang}</span>
          </div>
          {isSeries && <span className="absolute top-2 right-2 bg-[#b23838] text-white text-[9px] md:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-md">{m.episodes}</span>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute left-2 right-2 bottom-2 z-10">
            <h4 className="text-[12px] md:text-[14px] font-bold text-white leading-tight line-clamp-2 group-hover:text-[#d9a94d] transition-colors">{m.title}</h4>
          </div>
        </Link>
      ))}
    </div>
  );
};

const SidebarRanking = ({ title, movies, isSeries }) => (
  <div className="bg-[#1d130f] border border-[#34241b] rounded-xl p-5 mb-6">
    <h3 className="font-display text-[1.3rem] tracking-wide text-[#d9a94d] border-b border-[#34241b] pb-3 mb-4 flex items-center justify-between">
      <span>{title}</span>
    </h3>
    <div className="flex flex-col">
      {movies.slice(0, 10).map((m, idx) => (
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
              <span className="truncate">{m.originalTitle}</span>
            </div>
            {isSeries && <div className="text-[11px] text-[#b23838] font-bold mt-1">{m.episodes}</div>}
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default async function Home() {
  const data = await getHomepageData();

  return (
    <div className="min-h-screen bg-[#141414] text-[#f3ead9] flex flex-col">
      
      {/* 1. HERO BANNER */}
      {data.hero.length > 0 && <HeroSlider movies={data.hero} />}

      {/* 2. KHỐI THỂ LOẠI (LÊN LỚP CAO NHẤT z-[999] VÀ MỞ RỘNG TRÀN 2 BÊN) */}
      <div className="relative z-[999] -mt-[50px] md:-mt-[90px] px-[4%] w-full mb-8">
        <h2 className="text-[5vw] md:text-[1.5vw] font-bold mb-4 text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">
          Bạn đang quan tâm gì?
        </h2>
        
        {/* Lớp padding/margin âm giúp bóng (shadow) không bị cắt xén khi hover */}
        <div className="flex overflow-x-auto py-[15px] -mx-[15px] px-[15px] md:py-[25px] md:-mx-[50px] md:px-[50px] gap-3 md:gap-4 md:justify-center custom-scrollbar snap-x">
          {[
            { name: 'Phim Bộ', slug: 'phim-bo', grad: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
            { name: 'Phim Lẻ', slug: 'phim-le', grad: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)' },
            { name: 'Hàn Quốc', slug: 'han-quoc', grad: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
            { name: 'Trung Quốc', slug: 'trung-quoc', grad: 'linear-gradient(135deg, #b92b27 0%, #1565C0 100%)' },
            { name: 'Cổ Trang', slug: 'co-trang', grad: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
            { name: 'Hành Động', slug: 'hanh-dong', grad: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
            { name: 'Kinh Dị', slug: 'kinh-di', grad: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' },
            { name: 'Gia Đình', slug: 'gia-dinh', grad: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' }
          ].map((cat, idx) => (
            <Link href={`/danh-sach/${cat.slug}`} key={idx} 
              className="snap-start shrink-0 w-[140px] md:w-auto md:min-w-[130px] md:flex-1 max-w-[175px] h-[60px] md:h-[80px] flex items-center justify-center rounded-[10px] text-white font-bold text-[14px] md:text-[16px] cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:scale-105 hover:shadow-[0_12px_25px_rgba(0,0,0,0.9)] hover:border hover:border-white/40 transition-all duration-300"
              style={{ background: cat.grad }}>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="px-4 md:px-8 py-8 flex-grow max-w-[1500px] mx-auto w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 items-start">
          
          {/* CỘT TRÁI (MAIN) - ĐÃ FIX: Dùng gap-[60px] để các khu vực cách đều nhau tuyệt đối */}
          <div className="min-w-0 flex flex-col gap-[60px]">
            
            {/* 1. NÓN LÁ ĐỀ CỬ */}
            <MovieRowSlider title="Nón Lá Đề Cử" movies={data.deCu} />

            {/* 2. PHIM BỘ MỚI */}
            <section>
              <div className="flex items-center justify-between border-b border-[#34241b] pb-2 mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[3px] after:bg-[#d9a94d]">
                <h3 className="font-display text-[1.7rem] text-[#d9a94d]">Phim Bộ Mới</h3>
                <Link href="/danh-sach/phim-bo" className="text-[#ab9985] text-sm font-sans tracking-normal hover:text-white transition-colors">
                  Xem tất cả ❯
                </Link>
              </div>
              <BentoGrid movies={data.phimBo} isSeries={true} />
            </section>

            {/* 3. PHIM CHIẾU RẠP */}
            <section>
              <div className="flex items-center justify-between border-b border-[#34241b] pb-2 mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[3px] after:bg-[#b23838]">
                <h3 className="font-display text-[1.7rem] text-[#b23838]">Phim Chiếu Rạp</h3>
                <Link href="/danh-sach/phim-chieu-rap" className="text-[#ab9985] text-sm font-sans tracking-normal hover:text-white transition-colors">
                  Xem tất cả ❯
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data.chieuRap.slice(0, 10).map((m) => (
                  <Link href={`/watch/${m.slug}`} key={m.slug} className="group block">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden border border-[#34241b] bg-[#241a14] relative transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-[#b23838] shadow-md">
                      <img src={m.poster} className="w-full h-full object-cover opacity-90" alt={m.title} />
                      <span className="absolute top-2 left-2 bg-[#d9a94d] text-[#1d130a] text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm z-10">{m.quality}</span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#0a0806]/40 transition-opacity z-10">
                        <div className="w-12 h-12 bg-[#b23838] rounded-full flex items-center justify-center text-white pl-1">▶</div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <h4 className="text-[14px] font-bold text-[#f3ead9] truncate group-hover:text-[#b23838] transition-colors">{m.title}</h4>
                      <p className="text-[12px] text-[#6e5c4c]">{m.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 4. PHIM LẺ MỚI */}
            <section>
              <div className="flex items-center justify-between border-b border-[#34241b] pb-2 mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[3px] after:bg-[#d9a94d]">
                <h3 className="font-display text-[1.7rem] text-[#d9a94d]">Phim Lẻ Mới</h3>
                <Link href="/danh-sach/phim-le" className="text-[#ab9985] text-sm font-sans tracking-normal hover:text-white transition-colors">
                  Xem tất cả ❯
                </Link>
              </div>
              <BentoGrid movies={data.phimLe} isSeries={false} />
            </section>

            {/* 5. THẾ GIỚI ANIME */}
            {data.anime.length > 0 && (
              <section className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#0d091a] to-[#1a142c] border border-[#2a2344] relative flex flex-col md:flex-row shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                
                <Link href={`/watch/${data.anime[0].slug}`} className="w-full md:w-3/5 aspect-video relative group cursor-pointer block overflow-hidden">
                  <img src={data.anime[0].backdrop} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt={data.anime[0].title} />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#1a142c] hidden md:block"></div>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 bg-[#d9a94d]/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#150d0a] pl-1.5 shadow-[0_0_30px_rgba(217,169,77,0.5)] group-hover:scale-110 transition-transform">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </Link>

                <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-center relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-[1.2rem] text-[#8e74e6] tracking-widest uppercase">Thế Giới Anime</h3>
                    <Link href="/danh-sach/hoat-hinh" className="text-[#a599cc] text-xs font-sans tracking-normal hover:text-white transition-colors">
                      Xem tất cả ❯
                    </Link>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">{data.anime[0].title}</h4>
                  <p className="text-[#a599cc] text-[13px] line-clamp-3 mb-6 leading-relaxed">
                    {data.anime[0].description.replace(/<[^>]*>?/gm, '')}
                  </p>
                  
                  <div className="grid grid-cols-4 gap-3 mt-auto">
                    {data.anime.slice(1, 5).map((anime, i) => (
                      <Link href={`/watch/${anime.slug}`} key={i} className="aspect-[2/3] rounded border border-[#3b2e59] overflow-hidden group">
                        <img src={anime.poster} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" alt={anime.title}/>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* CỘT PHẢI (SIDEBAR) */}
          <aside className="sticky top-[90px] flex flex-col">
            <SidebarRanking title="Top Phim Bộ" movies={data.phimBo} isSeries={true} />
            <SidebarRanking title="Top Phim Lẻ" movies={data.phimLe} isSeries={false} />
          </aside>
          
        </div>
      </main>

      {/* 4. DẢI CUỘN PHIM ĐÃ ĐƯỢC CHUYỂN XUỐNG DƯỚI CÙNG */}
      <div className="filmstrip"></div>

    </div>
  );
}