import Image from 'next/image';
import Link from 'next/link';

const FALLBACK_IMAGE = 'https://via.placeholder.com/600x900?text=No+Poster';

function normalizeImage(path, cdnDomain = 'https://phimimg.com') {
  if (!path) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(path)) return path;
  const domain = cdnDomain.replace(/\/$/, '');
  const cleanPath = String(path).replace(/^\//, '');
  return `${domain}/${cleanPath}`;
}

function safePage(value) {
  const parsed = Number.parseInt(String(value ?? '1'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 999) : 1;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { next: { revalidate: 300 }, signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getFilteredMovies(slug, page = 1) {
  const endpoints = [
    `https://phim.nguonc.com/api/films/the-loai/${encodeURIComponent(slug)}?page=${page}`,
    `https://phim.nguonc.com/api/films/quoc-gia/${encodeURIComponent(slug)}?page=${page}`,
    `https://phim.nguonc.com/api/films/danh-sach/${encodeURIComponent(slug)}?page=${page}`,
  ];

  for (const url of endpoints) {
    const data = await fetchJson(url);
    if (data?.items?.length) {
      return {
        title: data?.paginate?.title || data?.seoOnPage?.titleHead || slug,
        items: data.items.map((m) => ({
          title: m.name || 'Đang cập nhật',
          originalTitle: m.original_name || m.origin_name || '',
          slug: m.slug,
          poster: normalizeImage(m.poster_url || m.thumb_url),
          year: m.year || 'Đang cập nhật',
          quality: m.quality || 'HD',
          episodes: m.episode_current || 'Tập mới',
        })),
        pagination: data.paginate || {},
      };
    }
  }

  const kkEndpoints = [
    `https://phimapi.com/v1/api/the-loai/${encodeURIComponent(slug)}?page=${page}`,
    `https://phimapi.com/v1/api/quoc-gia/${encodeURIComponent(slug)}?page=${page}`,
    `https://phimapi.com/v1/api/danh-sach/${encodeURIComponent(slug)}?page=${page}`,
  ];

  for (const url of kkEndpoints) {
    const data = await fetchJson(url);
    if (data?.data?.items?.length) {
      const cdn = data?.data?.APP_DOMAIN_CDN_IMAGE || data?.pathImage || 'https://phimimg.com';
      return {
        title: data.data.seoOnPage?.titleHead || data.data.titlePage || slug,
        items: data.data.items.map((m) => ({
          title: m.name || 'Đang cập nhật',
          originalTitle: m.origin_name || m.original_title || '',
          slug: m.slug,
          poster: normalizeImage(m.poster_url || m.thumb_url, cdn),
          year: m.year || 'Đang cập nhật',
          quality: m.quality || 'HD',
          episodes: m.episode_current || 'Tập mới',
        })),
        pagination: data.data.params?.pagination || {},
      };
    }
  }

  return null;
}

async function getSidebarMovies() {
  const json = await fetchJson('https://phimapi.com/v1/api/home');
  const items = json?.data?.items || json?.items || [];
  const cdn = json?.data?.APP_DOMAIN_CDN_IMAGE || json?.pathImage || 'https://phimimg.com';
  return items.slice(5, 15).map((m) => ({
    title: m.name || m.title || 'Đang cập nhật',
    originalTitle: m.origin_name || m.original_title || '',
    slug: m.slug,
    poster: normalizeImage(m.poster_url, cdn),
    year: m.year || 'Mới',
    episodes: m.episode_current || 'Tập mới',
  }));
}

function SidebarRanking({ title, movies }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a100c]/85 p-5 shadow-xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="font-display text-[1.35rem] tracking-wide text-[#d9a94d]">{title}</h2>
        <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#6e5c4c]">Top 10</span>
      </div>
      <div>
        {movies.map((m, idx) => (
          <Link href={`/watch/${m.slug}`} key={m.slug || idx} className="group flex items-center gap-3 border-b border-white/[.06] py-3 last:border-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-lg ${idx < 3 ? 'bg-[#d9a94d] text-[#1d130a]' : 'border border-white/10 bg-white/[.03] text-[#8e7966]'}`}>
              {idx + 1}
            </div>
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#241a14]">
              <Image src={m.poster} alt="" fill sizes="48px" className="object-cover transition duration-300 group-hover:scale-105" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-[#f3ead9] transition-colors group-hover:text-[#d9a94d]">{m.title}</div>
              <div className="mt-1 truncate text-[11px] text-[#6e5c4c]">{m.originalTitle || m.year}</div>
              <div className="mt-1 text-[11px] font-bold text-[#b23838]">{m.episodes}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function ListPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const slug = resolvedParams.slug;
  const page = safePage(resolvedSearch?.page);

  const [data, sidebarMovies] = await Promise.all([
    getFilteredMovies(slug, page),
    getSidebarMovies(),
  ]);

  if (!data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#120b09] px-4 pt-24">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#b23838]/30 bg-[#b23838]/10 text-2xl">!</div>
          <h1 className="font-display text-2xl text-white">Danh mục chưa có dữ liệu</h1>
          <p className="mt-2 text-sm text-[#8f7b69]">Nguồn phim hiện chưa trả về nội dung cho danh mục này.</p>
          <Link href="/" className="mt-5 inline-flex rounded-full bg-[#d9a94d] px-6 py-3 text-sm font-extrabold text-[#1d130a] transition hover:-translate-y-0.5 hover:bg-[#e4bb68]">Về trang chủ</Link>
        </div>
      </main>
    );
  }

  const totalPages = Math.max(1, Number(data.pagination?.totalPages || data.pagination?.total_pages || 1));
  const hasNext = page < totalPages;

  return (
    <main className="min-h-screen bg-[#120b09] px-4 pb-16 pt-[92px] md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-col gap-2 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[.28em] text-[#d9a94d]">Danh mục</span>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white md:text-4xl">{data.title}</h1>
          </div>
          <span className="text-xs text-[#6e5c4c]">Trang {page} / {totalPages}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 md:gap-5">
              {data.items.slice(0, 15).map((m) => (
                <Link href={`/watch/${m.slug}`} key={m.slug} className="group block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-[#21150f] shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:border-[#d9a94d]/50 group-hover:shadow-2xl">
                    <Image src={m.poster} alt={m.title} fill sizes="(max-width: 639px) 46vw, (max-width: 767px) 30vw, (max-width: 1279px) 23vw, 18vw" className="object-cover transition duration-500 group-hover:scale-[1.04] group-hover:opacity-75" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
                    <span className="absolute left-2 top-2 rounded-md border border-white/10 bg-black/65 px-2 py-1 text-[10px] font-extrabold text-[#d9a94d] backdrop-blur">{m.quality}</span>
                    <span className="absolute bottom-2 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-md border border-white/10 bg-[#7c2020]/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">{m.episodes}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b23838] pl-1 text-white shadow-[0_0_30px_rgba(178,56,56,.45)]">▶</div>
                    </div>
                  </div>
                  <div className="mt-2.5 min-w-0">
                    <h2 className="truncate text-sm font-bold text-[#f3ead9] transition-colors group-hover:text-[#d9a94d]">{m.title}</h2>
                    <p className="truncate text-xs text-[#6e5c4c]">{m.originalTitle || m.year}</p>
                  </div>
                </Link>
              ))}
            </div>

            <nav aria-label="Phân trang" className="mt-12 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link href={`?page=${page - 1}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-[#ab9985] transition hover:border-[#d9a94d]/40 hover:text-white">‹</Link>
              ) : <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[.02] text-[#40352e]">‹</span>}
              <span className="rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-xs font-bold text-[#bda996]">Trang {page} / {totalPages}</span>
              {hasNext ? (
                <Link href={`?page=${page + 1}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-[#ab9985] transition hover:border-[#d9a94d]/40 hover:text-white">›</Link>
              ) : <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[.02] text-[#40352e]">›</span>}
            </nav>
          </section>

          <aside className="hidden lg:block lg:sticky lg:top-[90px] lg:self-start">
            <SidebarRanking title="Nón Lá Đề Cử" movies={sidebarMovies} />
          </aside>
        </div>
      </div>
    </main>
  );
}
