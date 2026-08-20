import Link from 'next/link';
import { cache } from 'react';
import WatchClient from './WatchClient';
import { getMoviePeoplesAPI } from '@/utils/api';

const CACHE_OPTIONS = { next: { revalidate: 300 } };

function normalizeTitle(value) {
  return value ? value.toLowerCase().replace(/[\s\W_]+/g, '') : '';
}

function cleanSearchTitle(value) {
  return String(value || '').replace(/\(.*?\)/g, '').trim();
}

function isValidMoviePayload(data) {
  return Boolean(data && (data.status || data.movie || data.item || data.data?.item));
}

function toMovieInfo(movie, cdnDomain = 'https://phimimg.com') {
  if (!movie) return null;
  const toImage = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = cdnDomain.replace(/\/$/, '');
    return `${base}/${String(path).replace(/^\//, '')}`;
  };

  return {
    title: movie.name || movie.title || 'Đang cập nhật',
    originalTitle: movie.original_name || movie.origin_name || movie.original_title || '',
    slug: movie.slug || '',
    poster: toImage(movie.poster_url) || toImage(movie.thumb_url),
    description: movie.content || movie.description || 'Đang cập nhật nội dung...',
    year: movie.year || 'Đang cập nhật',
    quality: movie.quality || 'HD',
  };
}

function extractEpisodes(sourceName, data, serversList) {
  const epsData = data?.episodes || data?.movie?.episodes || data?.item?.episodes || [];
  if (!Array.isArray(epsData)) return;

  epsData.forEach((server, index) => {
    const serverItems = server?.server_data || server?.items || [];
    if (!Array.isArray(serverItems)) return;

    const episodes = serverItems
      .map((episode) => ({
        name: episode?.name || 'Tập',
        link: episode?.link_m3u8 || episode?.m3u8 || episode?.embed || episode?.link_embed || '',
      }))
      .filter((episode) => episode.link);

    if (!episodes.length) return;

    const dedupedEpisodes = Array.from(
      new Map(episodes.map((episode) => [`${episode.name}|${episode.link}`, episode])).values()
    );

    serversList.push({
      sourceName,
      serverName: server?.server_name || `Server ${index + 1}`,
      episodes: dedupedEpisodes,
    });
  });
}

function findMatch(items, movie) {
  if (!Array.isArray(items) || !items.length || !movie) return null;

  const title = normalizeTitle(movie.name || movie.title);
  const originalTitle = normalizeTitle(movie.origin_name || movie.original_name || movie.original_title);
  const year = String(movie.year || '');

  const exactYearMatch = items.find((item) => {
    const itemTitle = normalizeTitle(item?.name);
    const itemOriginal = normalizeTitle(item?.original_name || item?.origin_name || item?.original_title);
    const nameMatch = (originalTitle && itemOriginal === originalTitle) || itemTitle === title;
    return nameMatch && String(item?.year || '') === year;
  });
  if (exactYearMatch) return exactYearMatch;

  const closeYearMatch = items.find((item) => {
    const itemTitle = normalizeTitle(item?.name);
    const itemOriginal = normalizeTitle(item?.original_name || item?.origin_name || item?.original_title);
    const closeName =
      (itemOriginal && originalTitle && (itemOriginal.includes(originalTitle) || originalTitle.includes(itemOriginal))) ||
      (itemTitle && title && (itemTitle.includes(title) || title.includes(itemTitle)));
    return closeName && String(item?.year || '') === year;
  });
  if (closeYearMatch) return closeYearMatch;

  return items.find((item) => {
    const itemTitle = normalizeTitle(item?.name);
    const itemOriginal = normalizeTitle(item?.original_name || item?.origin_name || item?.original_title);
    return (originalTitle && itemOriginal === originalTitle) || itemTitle === title;
  }) || null;
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, CACHE_OPTIONS);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function resolveNguonCFromKkMovie(kkData) {
  const kkMovie = kkData?.movie;
  if (!kkMovie) return null;

  const keyword = cleanSearchTitle(
    kkMovie.origin_name || kkMovie.original_name || kkMovie.original_title || kkMovie.name || kkMovie.title
  );
  if (!keyword) return null;

  const searchData = await fetchJson(
    `https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword)}`
  );
  const match = findMatch(searchData?.items, kkMovie);
  if (!match?.slug) return null;

  const detailData = await fetchJson(`https://phim.nguonc.com/api/film/${encodeURIComponent(match.slug)}`);
  if (!detailData?.movie) return null;

  return detailData;
}

const getAggregatedMovie = cache(async function getAggregatedMovie(slug) {
  const safeSlug = encodeURIComponent(slug);
  const [nguonCData, kkData] = await Promise.all([
    fetchJson(`https://phim.nguonc.com/api/film/${safeSlug}`),
    fetchJson(`https://phimapi.com/phim/${safeSlug}`),
  ]);

  let baseMovieInfo = null;
  const serversList = [];

  // Layer 1: homepage uses KKPhim slugs, so KKPhim identifies the movie first.
  // NguonC is then resolved by original title + release year.
  if (kkData?.status && kkData?.movie) {
    const matchedNguonCData = await resolveNguonCFromKkMovie(kkData);

    if (matchedNguonCData?.movie) {
      baseMovieInfo = toMovieInfo(matchedNguonCData.movie);
      extractEpisodes('NguonC', matchedNguonCData, serversList);
    } else {
      baseMovieInfo = toMovieInfo(kkData.movie, 'https://phimimg.com');
    }

    // KKPhim always remains available as the fallback source.
    extractEpisodes('KKPhim', kkData, serversList);
  } else if (nguonCData?.movie) {
    // Preserve direct/deep links created from NguonC.
    baseMovieInfo = toMovieInfo(nguonCData.movie);
    extractEpisodes('NguonC', nguonCData, serversList);
  }

  if (!baseMovieInfo) return null;

  // Layer 3: the third and final source is VSMov.
  const vsmovDetail = (value) => `https://vsmov.com/api/phim/${encodeURIComponent(value)}`;
  const vsmovSearch = (keyword) => `https://vsmov.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;

  let vsmovData = await fetchJson(vsmovDetail(slug));

  if (!isValidMoviePayload(vsmovData)) {
    const keyword = cleanSearchTitle(baseMovieInfo.originalTitle || baseMovieInfo.title);
    if (keyword) {
      let searchData = await fetchJson(vsmovSearch(keyword));
      let items = searchData?.data?.items || searchData?.items || [];

      if (!items.length) {
        const cleanedKeyword = cleanSearchTitle(keyword);
        searchData = await fetchJson(vsmovSearch(cleanedKeyword));
        items = searchData?.data?.items || searchData?.items || [];
      }

      const match = findMatch(items, {
        name: baseMovieInfo.title,
        origin_name: baseMovieInfo.originalTitle,
        year: baseMovieInfo.year,
      });

      if (match?.slug) {
        vsmovData = await fetchJson(vsmovDetail(match.slug));
      }
    }
  }

  if (isValidMoviePayload(vsmovData)) {
    extractEpisodes('VSMov', vsmovData, serversList);
  }

  const peoples = await getMoviePeoplesAPI(kkData?.movie?.slug || baseMovieInfo.slug || slug);

  const uniqueServers = [];
  const seenServerKeys = new Set();
  for (const server of serversList) {
    const key = `${server.sourceName}|${server.serverName}|${server.episodes.map((episode) => episode.link).join(',')}`;
    if (seenServerKeys.has(key)) continue;
    seenServerKeys.add(key);
    uniqueServers.push(server);
  }

  return {
    ...baseMovieInfo,
    servers: uniqueServers,
    peoples,
  };
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const movie = await getAggregatedMovie(resolvedParams.slug);

  if (!movie) return { title: 'Không tìm thấy phim - NÓN LÁ' };

  return {
    title: `Xem phim ${movie.title} (${movie.year}) - NÓN LÁ`,
    description:
      movie.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) ||
      `Xem ${movie.title} trên NÓN LÁ.`,
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
          <p className="text-[#ab9985] mb-8">
            Có thể đường dẫn bị lỗi, hoặc toàn hệ thống chưa cập nhật bộ phim này.
          </p>
          <Link
            href="/"
            className="bg-[#d9a94d] text-[#1d130a] font-bold px-6 py-3 rounded hover:brightness-110 transition shadow-[0_0_15px_rgba(217,169,77,0.4)]"
          >
            Quay Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return <WatchClient movie={movie} />;
}
