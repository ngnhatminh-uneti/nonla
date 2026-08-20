import connectToDatabase from '@/lib/mongodb';
import Movie from '@/models/Movie';

const SOURCES = [
  { name: 'NguonC', detailUrl: 'https://phim.nguonc.com/api/film/' },
  { name: 'KKPhim', detailUrl: 'https://phimapi.com/phim/' },
  { name: 'OPhim', detailUrl: 'https://ophim1.com/v1/api/phim/' },
  { name: 'VSMov', detailUrl: 'https://vsmov.com/api/phim/' },
];

const REQUEST_TIMEOUT_MS = 10_000;
const fetchJson = async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Upstream ${response.status}: ${url}`);
  return response.json();
};

async function fetchSourceMovie(source, slug) {
  try {
    const data = await fetchJson(`${source.detailUrl}${encodeURIComponent(slug)}`);
    let movieInfo;
    let episodesData = [];

    if (source.name === 'OPhim') {
      movieInfo = data.data?.item;
      episodesData = movieInfo?.episodes || [];
    } else {
      movieInfo = data.movie || data.item;
      episodesData = data.episodes || movieInfo?.episodes || [];
    }

    const episodes = [];
    if (movieInfo && Array.isArray(episodesData)) {
      for (const server of episodesData) {
        const serverItems = server?.server_data || server?.items || [];
        const first = serverItems[0];
        const link = first?.link_m3u8 || first?.m3u8 || first?.embed || '';
        if (link) {
          episodes.push({
            serverName: `${source.name} - ${server?.server_name || 'VIP'}`,
            linkM3u8: link,
          });
        }
      }
    }

    return { source: source.name, movieInfo, episodes };
  } catch {
    return { source: source.name, movieInfo: null, episodes: [] };
  }
}

export async function crawlMovies() {
  try {
    await connectToDatabase();

    const listData = await fetchJson('https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1');
    if (!Array.isArray(listData?.items)) {
      return { success: false, error: 'Lỗi gọi API danh sách từ NguonC' };
    }

    let count = 0;

    for (const item of listData.items) {
      if (!item?.slug) continue;

      const results = await Promise.all(SOURCES.map((source) => fetchSourceMovie(source, item.slug)));
      const primary = results.find((result) => result.source === 'NguonC' && result.movieInfo) || results.find((result) => result.movieInfo);
      const aggregatedEpisodes = results.flatMap((result) => result.episodes);

      if (!primary?.movieInfo || aggregatedEpisodes.length === 0) continue;

      const baseMovieInfo = primary.movieInfo;
      const safeCategory = Array.isArray(baseMovieInfo.category)
        ? baseMovieInfo.category.map((c) => c?.name || c).filter(Boolean)
        : Array.isArray(baseMovieInfo.categories)
          ? baseMovieInfo.categories.map((c) => c?.name || c).filter(Boolean)
          : typeof baseMovieInfo.category === 'string'
            ? [baseMovieInfo.category]
            : [];

      const movieData = {
        title: baseMovieInfo.name,
        slug: baseMovieInfo.slug || item.slug,
        poster: baseMovieInfo.poster_url || baseMovieInfo.thumb_url,
        thumbnail: baseMovieInfo.thumb_url || baseMovieInfo.poster_url,
        description: baseMovieInfo.content || baseMovieInfo.description || '',
        year: baseMovieInfo.year,
        category: safeCategory,
        episodes: aggregatedEpisodes,
      };

      await Movie.findOneAndUpdate(
        { slug: movieData.slug },
        { $set: movieData },
        { upsert: true, returnDocument: 'after' }
      );
      count++;
    }

    return { success: true, message: `Đã đồng bộ đa nguồn ${count} bộ phim.` };
  } catch (error) {
    console.error('[crawler]', error);
    return { success: false, error: 'Không thể hoàn tất đồng bộ dữ liệu.' };
  }
}
