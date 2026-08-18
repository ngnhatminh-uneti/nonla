import Link from 'next/link';
import WatchClient from './WatchClient';
import { getMoviePeoplesAPI } from '@/utils/api'; 

async function getAggregatedMovie(slug) {
  let baseMovieInfo = null;
  let serversList = [];

  // 1. HÀM TRÍCH XUẤT TẬP PHIM (Dùng chung cho mọi nguồn)
  const extractEpisodes = (sourceName, data) => {
    let epsData = [];
    if (sourceName === 'OPhim') epsData = data?.data?.item?.episodes || [];
    else epsData = data?.episodes || data?.movie?.episodes || data?.item?.episodes || [];

    if (Array.isArray(epsData)) {
      epsData.forEach((srv, index) => {
        const srvItems = srv.server_data || srv.items || [];
        const parsedEps = srvItems.map(ep => ({
          name: ep.name,
          link: ep.link_m3u8 || ep.m3u8 || ep.embed || ep.link_embed || ''
        })).filter(ep => ep.link);

        if (parsedEps.length > 0) {
          serversList.push({
            sourceName: sourceName,
            serverName: srv.server_name || `Server ${index + 1}`,
            episodes: parsedEps
          });
        }
      });
    }
  };

  // 2. BƯỚC 1: Thử lấy NguonC bằng Slug trực tiếp (Phòng khi URL đã chuẩn NguonC)
  let nguonC_Base = false;
  try {
    const nguonCRes = await fetch(`https://phim.nguonc.com/api/film/${slug}`, { cache: 'no-store' });
    if (nguonCRes.ok) {
      const nguonCData = await nguonCRes.json();
      if (nguonCData?.movie) {
        const m = nguonCData.movie;
        baseMovieInfo = {
          title: m.name,
          originalTitle: m.original_name || m.origin_name || '',
          slug: m.slug,
          poster: m.poster_url || m.thumb_url,
          description: m.content || m.description || 'Đang cập nhật nội dung...',
          year: m.year || 'Đang cập nhật',
          quality: m.quality || 'HD',
        };
        extractEpisodes('NguonC', nguonCData);
        nguonC_Base = true; // Đánh dấu đã có NguonC làm gốc
      }
    }
  } catch(e) {}

  // 3. BƯỚC 2: TÌM NGƯỢC (REVERSE SEARCH) TỪ KKPHIM SANG NGUONC
  // Nếu Slug trực tiếp không có trên NguonC (Bị lệch slug do bấm từ trang chủ)
  let kkMovieCache = null;
  if (!nguonC_Base) {
    try {
      // Gọi KKPhim để lấy "Tên Gốc" và "Năm Phát Hành" chuẩn
      const kkRes = await fetch(`https://phimapi.com/phim/${slug}`, { cache: 'no-store' });
      if (kkRes.ok) {
        const kkData = await kkRes.json();
        if (kkData?.status && kkData?.movie) {
          kkMovieCache = kkData;
        }
      }
    } catch(e) {}

    // NẾU TỒN TẠI TRÊN KKPHIM -> ĐEM METADATA ĐI DÒ TÌM TRÊN NGUONC
    if (kkMovieCache) {
      const mKK = kkMovieCache.movie;
      const searchKeyword = mKK.origin_name || mKK.original_title || mKK.name || mKK.title;
      const cleanKeyword = searchKeyword.replace(/\(.*\)/g, '').trim();
      const targetYear = mKK.year;

      try {
        const searchRes = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(cleanKeyword)}`, { cache: 'no-store' });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const items = searchData?.items || [];

          if (items.length > 0) {
            const normalize = (s) => s ? s.toLowerCase().replace(/[\s\W_]+/g, '') : '';
            const t1 = normalize(mKK.name || mKK.title);
            const t2 = normalize(mKK.origin_name || mKK.original_title);

            // Dò tìm MỎ NEO: Phải khớp Tên & Khớp Năm Phát Hành
            let match = items.find(item => {
              const i1 = normalize(item.name);
              const i2 = normalize(item.original_name || item.origin_name);
              const isNameMatch = (i2 && t2 && i2 === t2) || (i1 === t1) || (i1.includes(t1)) || (t1.includes(i1));
              return isNameMatch && item.year == targetYear;
            });

            // Gỡ neo phụ: Nếu NguonC nhập sai năm, thử lấy khớp 100% tên gốc
            if (!match) {
              match = items.find(item => {
                const i2 = normalize(item.original_name || item.origin_name);
                return i2 && t2 && i2 === t2;
              });
            }

            // TÌM THẤY TRÊN NGUONC! -> Gọi API chi tiết của NguonC bằng Slug mới & Bắt làm GỐC
            if (match && match.slug) {
              const detailRes = await fetch(`https://phim.nguonc.com/api/film/${match.slug}`, { cache: 'no-store' });
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                if (detailData?.movie) {
                  const nm = detailData.movie;
                  baseMovieInfo = {
                    title: nm.name,
                    originalTitle: nm.original_name || nm.origin_name || '',
                    slug: nm.slug,
                    poster: nm.poster_url || nm.thumb_url,
                    description: nm.content || nm.description || 'Đang cập nhật nội dung...',
                    year: nm.year || 'Đang cập nhật',
                    quality: nm.quality || 'HD',
                  };
                  extractEpisodes('NguonC', detailData);
                  nguonC_Base = true; // Chuyển quyền Gốc về lại NguonC
                }
              }
            }
          }
        }
      } catch(e) {}

      // NẾU TÌM TRÊN NGUONC VẪN KHÔNG CÓ -> Chấp nhận dùng KKPhim làm Gốc
      if (!nguonC_Base) {
         const resHome = await fetch('https://phimapi.com/v1/api/home', { cache: 'no-store' });
         const dataHome = await resHome.json();
         const cdnDomain = dataHome?.data?.APP_DOMAIN_CDN_IMAGE || dataHome?.pathImage || 'https://phimimg.com';
         
         const getImg = (path) => {
           if (!path) return '';
           if (path.startsWith('http')) return path;
           let domain = cdnDomain.endsWith('/') ? cdnDomain.slice(0, -1) : cdnDomain;
           let cleanPath = path.startsWith('/') ? path.slice(1) : path;
           return `${domain}/${cleanPath}`;
         };

         baseMovieInfo = {
           title: mKK.name || mKK.title,
           originalTitle: mKK.origin_name || mKK.original_title || '',
           slug: mKK.slug,
           poster: getImg(mKK.poster_url) || getImg(mKK.thumb_url),
           description: mKK.content || mKK.description || 'Đang cập nhật nội dung...',
           year: mKK.year || 'Đang cập nhật',
           quality: mKK.quality || 'HD',
         };
      }
      
      // Dù NguonC hay KKPhim làm Gốc, đằng nào cũng đã Fetch KKPhim rồi -> Add luôn Server KKPhim
      extractEpisodes('KKPhim', kkMovieCache);
    }
  }

  // 4. Nếu Phim hoàn toàn không tồn tại trên cả NguonC & KKPhim
  if (!baseMovieInfo) return null;

  // 5. BƯỚC 3: THUẬT TOÁN DÒ TÌM THÔNG MINH CÁC VỆ TINH CÒN LẠI (OPhim, VSMov)
  const EXTRA_SOURCES = [
    { 
      name: 'OPhim', 
      detailUrl: (s) => `https://ophim1.com/v1/api/phim/${s}`,
      searchUrl: (kw) => `https://ophim1.com/v1/api/tim-kiem?keyword=${kw}`
    },
    { 
      name: 'VSMov', 
      detailUrl: (s) => `https://vsmov.com/api/phim/${s}`,
      searchUrl: (kw) => `https://vsmov.com/v1/api/tim-kiem?keyword=${kw}`
    }
  ];

  // Nếu KKPhim chưa được lấy (trường hợp NguonC Base thành công thẳng ở Bước 1), bổ sung đi dò tìm KKPhim
  if (serversList.every(s => s.sourceName !== 'KKPhim')) {
    EXTRA_SOURCES.push({ 
      name: 'KKPhim', 
      detailUrl: (s) => `https://phimapi.com/phim/${s}`,
      searchUrl: (kw) => `https://phimapi.com/v1/api/tim-kiem?keyword=${kw}`
    });
  }

  await Promise.all(EXTRA_SOURCES.map(async (src) => {
    try {
      // A. Thử gọi Slug gốc trước
      let res = await fetch(src.detailUrl(slug), { cache: 'no-store' });
      let data = res.ok ? await res.json() : null;
      let hasData = data && (data.status || data.movie || data.item);

      // B. Dò tìm mỏ neo "Tên + Năm" nếu Slug sai
      if (!hasData) {
        let searchKeyword = baseMovieInfo.originalTitle || baseMovieInfo.title;
        let searchRes = await fetch(src.searchUrl(encodeURIComponent(searchKeyword)), { cache: 'no-store' });
        
        let searchData = searchRes.ok ? await searchRes.json() : null;
        let items = searchData?.data?.items || searchData?.items || [];

        if (items.length === 0) {
          let cleanKeyword = searchKeyword.replace(/\(.*\)/g, '').trim();
          searchRes = await fetch(src.searchUrl(encodeURIComponent(cleanKeyword)), { cache: 'no-store' });
          searchData = searchRes.ok ? await searchRes.json() : null;
          items = searchData?.data?.items || searchData?.items || [];
        }

        if (items.length > 0) {
          const normalize = (s) => s ? s.toLowerCase().replace(/[\s\W_]+/g, '') : '';
          const t1 = normalize(baseMovieInfo.title);
          const t2 = normalize(baseMovieInfo.originalTitle);
          const targetYear = baseMovieInfo.year; 

          let match = items.find(item => {
            const i1 = normalize(item.name);
            const i2 = normalize(item.origin_name || item.original_title);
            const isNameMatch = (i2 && t2 && i2 === t2) || (i1 === t1);
            return isNameMatch && item.year == targetYear;
          });

          if (!match) {
            match = items.find(item => {
              const i1 = normalize(item.name);
              const i2 = normalize(item.origin_name || item.original_title);
              const isCloseMatch = (i1.includes(t1) || t1.includes(i1) || (i2 && t2 && (i2.includes(t2) || t2.includes(i2))));
              return isCloseMatch && item.year == targetYear;
            });
          }

          if (!match) {
            match = items.find(item => {
              const i1 = normalize(item.name);
              const i2 = normalize(item.origin_name || item.original_title);
              return (i2 && t2 && i2 === t2) || (i1 === t1);
            });
          }

          if (match && match.slug) {
            const fallbackRes = await fetch(src.detailUrl(match.slug), { cache: 'no-store' });
            if (fallbackRes.ok) {
              data = await fallbackRes.json();
              hasData = true;
            }
          }
        }
      }

      // C. Ráp Server
      if (hasData) {
        extractEpisodes(src.name, data);
      }
    } catch (e) {}
  }));

  // 6. Lấy Diễn Viên
  const peoples = await getMoviePeoplesAPI(slug);

  return {
    ...baseMovieInfo,
    servers: serversList,
    peoples: peoples 
  };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const movie = await getAggregatedMovie(resolvedParams.slug);
  if (!movie) return { title: 'Không tìm thấy phim - NÓN LÁ' };
  
  return {
    title: `Xem phim ${movie.title} (${movie.year}) - NÓN LÁ`,
    description: movie.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const movie = await getAggregatedMovie(resolvedParams.slug);

  if (!movie || movie.servers.length === 0) {
    return (
      <div className="min-h-screen bg-[#150d0a] text-white flex flex-col items-center justify-center pt-20">
        <div className="bg-[#1d130f] border border-[#34241b] p-10 rounded-xl text-center max-w-lg shadow-2xl">
          <h1 className="text-2xl font-display mb-4 text-[#b23838]">Rất tiếc, phim không tồn tại!</h1>
          <p className="text-[#ab9985] mb-8">Có thể đường dẫn bị lỗi, hoặc toàn hệ thống chưa cập nhật bộ phim này.</p>
          <Link href="/" className="bg-[#d9a94d] text-[#1d130a] font-bold px-6 py-3 rounded hover:brightness-110 transition shadow-[0_0_15px_rgba(217,169,77,0.4)]">
            Quay Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return <WatchClient movie={movie} />;
}