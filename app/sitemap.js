const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export default function sitemap() {
  const now = new Date();
  const routes = [
    '/',
    '/danh-sach/phim-bo',
    '/danh-sach/phim-le',
    '/danh-sach/phim-chieu-rap',
    '/danh-sach/hoat-hinh',
    '/gioi-thieu',
    '/dieu-khoan',
    '/chinh-sach-bao-mat',
    '/lien-he',
    '/tai-app',
  ];

  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
