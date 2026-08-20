import Link from 'next/link';
import { cache } from 'react';
import WatchClient from './WatchClient';
import { getMoviePeoplesAPI } from '@/utils/api';

const getAggregatedMovie = cache(async function getAggregatedMovie(slug) {
  const safeSlug = encodeURIComponent(slug);
  let baseMovieInfo = null;
  let serversList = [];

  const extractEpisodes = (sourceName, data) => {
    let epsData = [];
    if (sourceName === 'OPhim') epsData = data?.data?.item?.episodes || [];
    else epsData = data?.episodes || data?.movie?.episodes || data?.item?.episodes || [];

    if (!Array.isArray(epsData)) return;

    epsData.forEach((srv, index) => {
      const srvItems = srv.server_data || srv.items || [];
      const parsedEps = Array.isArray(srvItems)
        ? srvItems.map((ep) => ({
            name: ep.name || 'Tập',
            link: ep.link_m3u8 || ep.m3u8 || ep.embed || ep.link_embed || '',
          })).filter((ep) => ep.link)
        : [];

      if (parsedEps.length > 0) {
        serversList.push({
          sourceName,
          serverName: srv.server_name || `Server ${index + 1}`,
          episodes: parsedEps,
        });
      }
    });
  };

  let nguonC_Base = false;
  try {
    const nguonCRes = await fetch(`https://phim.nguonc.com/api/film/${safeSlug}`, { next: { revalidate: 300 } });
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
        nguonC_Base = true;
      }
    }
  } catch {}

  let kkMovieCache = null;
  if (!nguonC_Base) {
    try {
      const kkRes = await fetch(`https://phimapi.com/phim/${safeSlug}`, { next: { revalidate: 300 } });
      if (kkRes.ok) {
        const kkData = await kkRes.json();
        if (kkData?.status && kkData?.movie) kkMovieCache = kkData;
      }
    } catch {}

    if (kkMovieCache) {
      const mKK = kkMovieCache.movie;
      const searchKeyword = mKK.origin_name || mKK.original_title || mKK.name || mKK.title;
      const cleanKeyword = searchKeyword.replace(/\(.*\)/g, '').trim();
      const targetYear = mKK.year;

      try {
        const searchRes = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(cleanKeyword)}`, { next: { revalidate: 300 } });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const items = searchData?.items || [];

          if (items.length > 0) {
            const normalize = (s) => s ? s.toLowerCase().replace(/[\s\W_]+/g, '') : '';
            const t1 = normalize(mKK.name || mKK.title);
            const t2 = normalize(mKK.origin_name || mKK.original_title);

            let match = items.find((item) => {
              const i1 = normalize(item.name);
              const i2 = normalize(item.original_name || item.origin_name);
              const isNameMatch = (i2 && t2 && i2 === t2) || (i1 === t1) || i1.includes(t1) || t1.includes(i1);
              return isNameMatch && item.year == targetYear;
            });

            if (!match) {
              match = items.find((item) => {
                const i2 = normalize(item.original_name || item.origin_name);
                return i2 && t2 && i2 === t2;
              });
            }

            if (match?.slug) {
              const detailRes = await fetch(`https://phim.nguonc.com/api/film/${encodeURIComponent(match.slug)}`, { next: { revalidate: 300 } });
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
                  nguonC_Base = true;
                }
              }
            }
          }
        }
      } catch {}

      if (!nguonC_Base) {
        const cdnDomain = 'https://phimimg.com';
        const getImg = (path) => {
          if (!path) return '';
          if (path.startsWith('http')) return path;
          const cleanPath = path.startsWith('/') ? path.slice(1) : path;
          return `${cdnDomain}/${cleanPath}`;
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

      extractEpisodes('KKPhim', kkMovieCache);
    }
  }

  if (!baseMovieInfo) return null;

  const EXTRA_SOURCES = [
    {
      name: 'OPhim',
      detailUrl: (s) => `https://ophim1.com/v1/api/phim/${encodeURIComponent(s)}`,
      searchUrl: (kw) => `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(kw)}`,
    },
    {
      name: 'VSMov',
      detailUrl: (s) => `https://vsmov.com/api/phim/${encodeURIComponent(s)}`,
      searchUrl: (kw) => `https://vsmov.com/v1/api/tim-kiem?keyword=${encodeURIComponent(kw)}`,
    },
  ];

  if (serversList.every((s) => s.sourceName !== 'KKPhim')) {
    EXTRA_SOURCES.push({
      name: 'KKPhim',
      detailUrl: (s) => `https://phimapi.com/phim/${encodeURIComponent(s)}`,
      searchUrl: (kw) => `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(kw)}`,
    });
  }

  await Promise.all(EXTRA_SOURCES.map(async (src) => {
    try {
      let res = await fetch(src.detailUrl(slug), { next: { revalidate: 300 } });
      let data = res.ok ? await res.json() : null;
      let hasData = data && (data.status || data.movie || data.item);

      if (!hasData) {
        const searchKeyword = baseMovieInfo.originalTitle || baseMovieInfo.title;
        let searchRes = await fetch(src.searchUrl(searchKeyword), { next: { revalidate: 300 } });
        let searchData = searchRes.ok ? await searchRes.json() : null;
        let items = searchData?.data?.items || searchData?.items || [];

        if (items.length === 0) {
          const cleanKeyword = searchKeyword.replace(/\(.*\)/g, '').trim();
          searchRes = await fetch(src.searchUrl(cleanKeyword), { next: { revalidate: 300 } });
          searchData = searchRes.ok ? await searchRes.json() : null;
          items = searchData?.data?.items || searchData?.items || [];
        }

        if (items.length > 0) {
          const normalize = (s) => s ? s.toLowerCase().replace(/[\s\W_]+/g, '') : '';
          const t1 = normalize(baseMovieInfo.title);
          const t2 = normalize(baseMovieInfo.originalTitle);
          const targetYear = baseMovieInfo.year;

          let match = items.find((item) => {
            const i1 = normalize(item.name);
            const i2 = normalize(item.origin_name || item.original_title);
            return ((i2 && t2 && i2 === t2) || i1 === t1) && item.year == targetYear;
          });

          if (!match) {
            match = items.find((item) => {
              const i1 = normalize(item.name);
              const i2 = normalize(item.origin_name || item.original_title);
              const close = i1.includes(t1) || t1.includes(i1) || (i2 && t2 && (i2.includes(t2) || t2.includes(i2)));
              return close && item.year == targetYear;
            });
          }

          if (!match) {
            match = items.find((item) => {
              const i1 = normalize(item.name);
              const i2 = normalize(item.origin_name || item.original_title);
              return (i2 && t2 && i2 === t2) || i1 === t1;
            });
          }

          if (match?.slug) {
            const fallbackRes = await fetch(src.detailUrl(match.slug), { next: { revalidate: 300 } });
            if (fallbackRes.ok) {
              data = await fallbackRes.json();
              hasData = true;
            }
          }
        }
      }

      if (hasData) extractEpisodes(src.name, data);
    } catch {}
  }));

  const peoples = await getMoviePeoplesAPI(slug);

  return {
    ...baseMovieInfo,
    servers: serversList,
    peoples,
  };
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const movie = await getAggregatedMovie(resolvedParams.slug);
  if (!movie) return { title: 'Không tìm thấy phim - NÓN LÁ' };

  return {
    title: `Xem phim ${movie.title} (${movie.year}) - NÓN LÁ`,
    description: movie.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Xem ${movie.title} trên NÓN LÁ.`,
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
