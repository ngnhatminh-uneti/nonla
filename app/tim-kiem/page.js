import Link from 'next/link';

async function searchMovies(keyword) {
  try {
    const res = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword)}`, { cache: 'no-store' });
    const data = await res.json();
    return data?.items || [];
  } catch (error) { return []; }
}

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const keyword = resolvedSearchParams.keyword || '';
  const items = keyword ? await searchMovies(keyword) : [];

  return (
    <div className="min-h-screen bg-[#150d0a] text-[#f3ead9] pt-24 pb-20 px-6 md:px-12 max-w-[1500px] mx-auto">
      <h1 className="font-display text-[2rem] text-[#d9a94d] border-b border-[#34241b] pb-4 mb-8">
        Kết quả tìm kiếm cho: <span className="text-white">"{keyword}"</span>
      </h1>
      
      {items.length === 0 ? (
        <div className="text-center py-20 text-[#ab9985]">Không tìm thấy bộ phim nào phù hợp.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {items.map((movie) => (
            <Link href={`/watch/${movie.slug}`} key={movie.slug} className="group block cursor-pointer">
              <div className="aspect-[2/3] rounded-lg overflow-hidden border border-[#34241b] bg-[#241a14] relative transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#d9a94d]">
                <img src={movie.thumb_url || movie.poster_url} className="w-full h-full object-cover opacity-90" alt={movie.name} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity z-10">
                  <div className="w-12 h-12 bg-[#b23838] rounded-full flex items-center justify-center text-white pl-1">▶</div>
                </div>
              </div>
              <div className="mt-3">
                <h4 className="text-[14px] font-bold text-[#f3ead9] truncate">{movie.name}</h4>
                <p className="text-[12px] text-[#6e5c4c] truncate">{movie.year || 'Mới'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}