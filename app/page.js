import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import MovieRowSlider from '@/components/MovieRowSlider';
import UserRows from '@/components/UserRows';
import { AdSlot } from '@/components/AdsManager';

export const revalidate = 0;

async function fetchKKPhimAPI(endpoint) {
  try {
    const res = await fetch(`https://phimapi.com${endpoint}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.data?.items || json?.items || [];
    const cdnDomain = json?.data?.APP_DOMAIN_CDN_IMAGE || json?.pathImage || 'https://phimimg.com';

    return items.map((m) => {
      const getImg = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const domain = cdnDomain.endsWith('/') ? cdnDomain.slice(0, -1) : cdnDomain;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${domain}/${cleanPath}`;
      };
      const poster = getImg(m.poster_url);
      const thumb = getImg(m.thumb_url);
      return {
        title: m.name || m.title || 'Đang cập nhật',
        originalTitle: m.origin_name || m.original_title || '',
        slug: m.slug,
        poster: poster || 'https://via.placeholder.com/600x800?text=No+Poster',
        backdrop: thumb || poster || 'https://via.placeholder.com/1200x800?text=No+Background',
        year: m.year || 'Mới',
        quality: m.quality || 'HD',
        lang: m.lang || 'Vietsub',
        episodes: m.episode_current || 'Tập mới',
        description: m.content || m.description || 'Nội dung đang được cập nhật...',
      };
    });
  } catch {
    return [];
  }
}

async function getHomepageData() {
  const [homeData, seriesData, singleData, cinemaData, animeData] = await Promise.all([
    fetchKKPhimAPI('/v1/api/home'),
    fetchKKPhimAPI('/v1/api/danh-sach/phim-bo?limit=10'),
    fetchKKPhimAPI('/v1/api/danh-sach/phim-le?limit=10'),
    fetchKKPhimAPI('/v1/api/danh-sach/phim-chieu-rap?limit=10'),
    fetchKKPhimAPI('/v1/api/danh-sach/hoat-hinh?limit=10'),
  ]);
  return {
    hero: homeData.slice(0, 5),
    deCu: homeData.slice(5, 15),
    phimBo: seriesData,
    phimLe: singleData,
    chieuRap: cinemaData,
    anime: animeData,
  };
}

const ratingFromSlug = (slug = '') => {
  let total = 0;
  for (let i = 0; i < slug.length; i += 1) total = (total + slug.charCodeAt(i) * (i + 1)) % 10;
  return `8.${total}`;
};

const BentoGrid = ({ movies, isSeries }) => {
  if (!movies?.length) return null;
  const feature = movies[0];
  const smalls = movies.slice(1, 9);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <Link href={`/watch/${feature.slug}`} className="group relative col-span-2 row-span-2 block min-h-[220px] overflow-hidden rounded-xl border border-[#34241b] bg-[#241a14] md:min-h-[340px]">
        <img src={feature.backdrop} className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" alt={feature.title}/>
        <div className="absolute left-2.5 top-2.5 z-10 flex gap-1.5"><span className="rounded bg-[#f5c518] px-2 py-0.5 text-[11px] font-extrabold text-black">{feature.quality}</span><span className="rounded border border-white/20 bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">{feature.lang}</span></div>
        {isSeries && <span className="absolute right-2.5 top-2.5 rounded bg-[#b23838] px-2 py-0.5 text-[11px] font-extrabold text-white shadow-md">{feature.episodes}</span>}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"/>
        <div className="absolute bottom-4 left-4 right-4 z-10"><h3 className="mb-1 text-xl font-extrabold leading-tight text-white transition-colors group-hover:text-[#d9a94d] md:text-[22px]">{feature.title}</h3><p className="truncate text-[13px] text-[#ab9985] md:text-[14px]">{feature.originalTitle}</p></div>
      </Link>
      {smalls.map((movie) => (
        <Link href={`/watch/${movie.slug}`} key={movie.slug} className="group relative col-span-1 row-span-1 block aspect-video overflow-hidden rounded-xl border border-[#34241b] bg-[#241a14]">
          <img src={movie.backdrop} className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" alt={movie.title}/>
          <div className="absolute left-2 top-2 z-10 flex gap-1"><span className="rounded bg-[#f5c518] px-1.5 py-0.5 text-[9px] font-extrabold text-black md:text-[10px]">{movie.quality}</span><span className="max-w-[90px] truncate rounded border border-white/20 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm md:text-[10px]">{movie.lang}</span></div>
          {isSeries && <span className="absolute right-2 top-2 rounded bg-[#b23838] px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-md md:text-[10px]">{movie.episodes}</span>}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"/>
          <div className="absolute bottom-2 left-2 right-2 z-10"><h4 className="line-clamp-2 text-[12px] font-bold leading-tight text-white transition-colors group-hover:text-[#d9a94d] md:text-[14px]">{movie.title}</h4></div>
        </Link>
      ))}
    </div>
  );
};

const SidebarRanking = ({ title, movies, isSeries }) => (
  <div className="mb-5 rounded-xl border border-white/5 bg-white/[.02] p-4">
    <h3 className="mb-3 flex items-center justify-between border-b border-white/10 pb-3 font-display text-[1.25rem] tracking-wide text-[#d9a94d]"><span>{title}</span><span className="text-xs text-[#777]">TOP 10</span></h3>
    <div className="flex flex-col">
      {movies.slice(0, 10).map((movie, idx) => (
        <Link href={`/watch/${movie.slug}`} key={movie.slug || idx} className="group flex items-center gap-3 border-b border-[#34241b] py-2.5 last:border-0">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded font-display text-[18px] shadow-sm ${idx < 3 ? 'bg-[#d9a94d] text-[#1d130a]' : 'border border-[#34241b] bg-[#241a14] text-[#ab9985]'}`}>{idx + 1}</div>
          <img src={movie.poster} className="h-16 w-12 rounded object-cover shadow-md" alt={movie.title}/>
          <div className="min-w-0 flex-1">
            <div className="mb-1 truncate text-[14px] font-bold text-[#f3ead9] transition-colors group-hover:text-[#d9a94d]">{movie.title}</div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6e5c4c]"><span className="text-[#d9a94d]">★ {ratingFromSlug(movie.slug)}</span><span>•</span><span className="truncate">{movie.originalTitle}</span></div>
            {isSeries && <div className="mt-1 text-[11px] font-bold text-[#b23838]">{movie.episodes}</div>}
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default async function Home() {
  const data = await getHomepageData();
  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-col bg-[#141414] text-[#f3ead9]">
      {data.hero.length > 0 && <HeroSlider movies={data.hero} />}
      <div className="relative z-[999] -mt-[50px] mb-8 w-full px-[4%] md:-mt-[90px]">
        <h2 className="mb-4 text-[5vw] font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,.9)] md:text-[1.5vw]">Bạn đang quan tâm gì?</h2>
        <div className="flex snap-x gap-3 overflow-x-auto px-[15px] py-[15px] custom-scrollbar md:-mx-[50px] md:gap-4 md:px-[50px] md:py-[25px] md:justify-center">
          {[
            ['Phim Bộ','phim-bo','linear-gradient(135deg,#11998e 0%,#38ef7d 100%)'],['Phim Lẻ','phim-le','linear-gradient(135deg,#4776E6 0%,#8E54E9 100%)'],['Hàn Quốc','han-quoc','linear-gradient(135deg,#0ba360 0%,#3cba92 100%)'],['Trung Quốc','trung-quoc','linear-gradient(135deg,#b92b27 0%,#1565C0 100%)'],['Cổ Trang','co-trang','linear-gradient(135deg,#ff7e5f 0%,#feb47b 100%)'],['Hành Động','hanh-dong','linear-gradient(135deg,#cb2d3e 0%,#ef473a 100%)'],['Kinh Dị','kinh-di','linear-gradient(135deg,#141E30 0%,#243B55 100%)'],['Gia Đình','gia-dinh','linear-gradient(135deg,#f12711 0%,#f5af19 100%)'],
          ].map(([name, slug, grad]) => <Link key={slug} href={`/danh-sach/${slug}`} className="flex h-[60px] w-[140px] shrink-0 snap-start items-center justify-center rounded-[10px] border border-white/10 text-[14px] font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,.5)] transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:border-white/40 md:h-[80px] md:w-auto md:max-w-[175px] md:min-w-[130px] md:flex-1 md:text-[16px]" style={{ background: grad }}>{name}</Link>)}
        </div>
      </div>
      <main className="mx-auto w-full max-w-[1500px] flex-grow px-4 py-8 md:px-8">
        <AdSlot zone="home_top" />
        <UserRows />
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="flex min-w-0 flex-col gap-[60px]">
            <MovieRowSlider title="Nón Lá Đề Cử" movies={data.deCu} />
            <section><div className="relative mb-6 flex items-center justify-between border-b border-[#34241b] pb-2 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-12 after:bg-[#d9a94d] "><h3 className="font-display text-[1.7rem] text-[#d9a94d]">Phim Bộ Mới</h3><Link href="/danh-sach/phim-bo" className="text-sm text-[#ab9985] hover:text-white">Xem tất cả ❯</Link></div><BentoGrid movies={data.phimBo} isSeries /></section>
            <section><div className="relative mb-6 flex items-center justify-between border-b border-[#34241b] pb-2 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-12 after:bg-[#b23838]"><h3 className="font-display text-[1.7rem] text-[#b23838]">Phim Chiếu Rạp</h3><Link href="/danh-sach/phim-chieu-rap" className="text-sm text-[#ab9985] hover:text-white">Xem tất cả ❯</Link></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{data.chieuRap.slice(0,10).map((movie) => <Link href={`/watch/${movie.slug}`} key={movie.slug} className="group block"><div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-[#34241b] bg-[#241a14] shadow-md"><img src={movie.poster} className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105" alt={movie.title}/><span className="absolute left-2 top-2 rounded bg-[#d9a94d] px-1.5 py-0.5 text-[10px] font-extrabold text-[#1d130a]">{movie.quality}</span><div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b23838] pl-1 text-white">▶</div></div></div><div className="mt-2 text-center"><h4 className="truncate text-[14px] font-bold text-[#f3ead9] group-hover:text-[#b23838]">{movie.title}</h4><p className="text-[12px] text-[#6e5c4c]">{movie.year}</p></div></Link>)}</div></section>
            <section><div className="relative mb-6 flex items-center justify-between border-b border-[#34241b] pb-2 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-12 after:bg-[#d9a94d]"><h3 className="font-display text-[1.7rem] text-[#d9a94d]">Phim Lẻ Mới</h3><Link href="/danh-sach/phim-le" className="text-sm text-[#ab9985] hover:text-white">Xem tất cả ❯</Link></div><BentoGrid movies={data.phimLe} isSeries={false}/></section>
            {data.anime.length > 0 && <section className="relative flex flex-col overflow-hidden rounded-2xl border border-[#2a2344] bg-gradient-to-r from-[#0d091a] to-[#1a142c] shadow-[0_15px_40px_rgba(0,0,0,.6)] md:flex-row"><Link href={`/watch/${data.anime[0].slug}`} className="group block aspect-video w-full overflow-hidden md:w-3/5"><img src={data.anime[0].backdrop} className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" alt={data.anime[0].title}/></Link><div className="relative z-10 flex w-full flex-col justify-center p-6 md:w-2/5 md:p-8"><div className="mb-2 flex items-center justify-between"><h3 className="font-display text-[1.2rem] uppercase tracking-widest text-[#8e74e6]">Thế Giới Anime</h3><Link href="/danh-sach/hoat-hinh" className="text-xs text-[#a599cc] hover:text-white">Xem tất cả ❯</Link></div><h4 className="mb-3 text-2xl font-extrabold leading-tight text-white md:text-3xl">{data.anime[0].title}</h4><p className="mb-6 line-clamp-3 text-[13px] leading-relaxed text-[#a599cc]">{data.anime[0].description.replace(/<[^>]*>?/gm, '')}</p><div className="mt-auto grid grid-cols-4 gap-3">{data.anime.slice(1,5).map((anime) => <Link href={`/watch/${anime.slug}`} key={anime.slug} className="aspect-[2/3] overflow-hidden rounded border border-[#3b2e59]"><img src={anime.poster} className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" alt={anime.title}/></Link>)}</div></div></section>}
          </div>
          <aside className="sticky top-[90px] flex max-h-[calc(100vh-110px)] flex-col overflow-y-auto pr-1 custom-scrollbar" suppressHydrationWarning>
            <SidebarRanking title="Top Phim Bộ" movies={data.phimBo} isSeries />
            <SidebarRanking title="Top Phim Lẻ" movies={data.phimLe} />
          </aside>
        </div>
      </main>
      <div className="filmstrip" />
    </div>
  );
}
