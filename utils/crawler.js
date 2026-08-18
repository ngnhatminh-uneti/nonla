import connectToDatabase from '@/lib/mongodb';
import Movie from '@/models/Movie';

const SOURCES = [
  { name: 'NguonC', detailUrl: 'https://phim.nguonc.com/api/film/' },
  { name: 'KKPhim', detailUrl: 'https://phimapi.com/phim/' },
  { name: 'OPhim', detailUrl: 'https://ophim1.com/v1/api/phim/' },
  { name: 'VSMov', detailUrl: 'https://vsmov.com/api/phim/' }
];

export async function crawlMovies() {
  try {
    await connectToDatabase();

    const listRes = await fetch('https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1');
    const listData = await listRes.json();

    if (!listData || !listData.items) {
      return { success: false, error: "Lỗi gọi API danh sách từ NguonC" };
    }

    let count = 0;

    for (const item of listData.items) {
      const slug = item.slug;
      let baseMovieInfo = null;
      let aggregatedEpisodes = [];

      for (const source of SOURCES) {
        try {
          const detailRes = await fetch(`${source.detailUrl}${slug}`);
          const data = await detailRes.json();

          let movieInfo = null;
          let episodesData = [];

          if (source.name === 'OPhim') {
            movieInfo = data.data?.item;
            episodesData = movieInfo?.episodes || [];
          } else {
            movieInfo = data.movie || data.item;
            episodesData = data.episodes || movieInfo?.episodes || [];
          }

          if (movieInfo) {
            if (!baseMovieInfo || source.name === 'NguonC') {
              baseMovieInfo = movieInfo;
            }

            if (Array.isArray(episodesData)) {
              episodesData.forEach(server => {
                const serverItems = server.server_data || server.items || [];
                if (serverItems.length > 0) {
                  const link = serverItems[0].link_m3u8 || serverItems[0].m3u8 || serverItems[0].embed || '';
                  if (link) {
                    aggregatedEpisodes.push({
                      serverName: `${source.name} - ${server.server_name || 'VIP'}`,
                      linkM3u8: link
                    });
                  }
                }
              });
            }
          }
        } catch (err) {
          continue;
        }
      }

      if (baseMovieInfo && aggregatedEpisodes.length > 0) {
        // Fix lỗi category: Kiểm tra an toàn trước khi dùng .map()
        let safeCategory = [];
        if (Array.isArray(baseMovieInfo.category)) {
          safeCategory = baseMovieInfo.category.map(c => c?.name || c);
        } else if (Array.isArray(baseMovieInfo.categories)) {
          safeCategory = baseMovieInfo.categories.map(c => c?.name || c);
        } else if (typeof baseMovieInfo.category === 'string') {
          safeCategory = [baseMovieInfo.category];
        }

        const movieData = {
          title: baseMovieInfo.name,
          slug: baseMovieInfo.slug,
          poster: baseMovieInfo.poster_url || baseMovieInfo.thumb_url,
          thumbnail: baseMovieInfo.thumb_url || baseMovieInfo.poster_url,
          description: baseMovieInfo.content || baseMovieInfo.description,
          year: baseMovieInfo.year,
          category: safeCategory, // Đã fix lỗi
          episodes: aggregatedEpisodes, 
        };

        await Movie.findOneAndUpdate(
          { slug: movieData.slug },
          movieData,
          { upsert: true, returnDocument: 'after' }
        );
        count++;
      }
    }

    return { success: true, message: `Đã cào đa nguồn thành công ${count} bộ phim!` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}