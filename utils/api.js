const DEFAULT_TIMEOUT_MS = 8000;

async function fetchJson(url, { timeout = DEFAULT_TIMEOUT_MS, cache = 'no-store' } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal, cache });
    if (!response.ok) return null;
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function searchMoviesAPI(keyword) {
  const normalized = String(keyword || '').trim().slice(0, 120);
  if (!normalized) return [];

  try {
    const data = await fetchJson(
      `https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(normalized)}`,
      { timeout: 6000, cache: 'no-store' }
    );
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function getFiltersAPI() {
  try {
    const [categories, countries] = await Promise.all([
      fetchJson('https://phimapi.com/the-loai', { cache: 'force-cache', timeout: 6000 }),
      fetchJson('https://phimapi.com/quoc-gia', { cache: 'force-cache', timeout: 6000 }),
    ]);

    return {
      categories: Array.isArray(categories) ? categories : [],
      countries: Array.isArray(countries) ? countries : [],
    };
  } catch {
    return { categories: [], countries: [] };
  }
}

export async function getMoviePeoplesAPI(slug) {
  const safeSlug = String(slug || '').trim().slice(0, 180);
  if (!safeSlug) return null;

  try {
    const data = await fetchJson(
      `https://phimapi.com/v1/api/phim/${encodeURIComponent(safeSlug)}/peoples`,
      { cache: 'force-cache', timeout: 6000 }
    );
    return data?.status && data?.data ? data.data : null;
  } catch {
    return null;
  }
}
