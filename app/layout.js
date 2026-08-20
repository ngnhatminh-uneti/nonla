import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NÓN LÁ — Xem phim online',
    template: '%s | NÓN LÁ',
  },
  description: 'Khám phá phim bộ, phim lẻ, chiếu rạp và anime trên NÓN LÁ.',
  applicationName: 'NÓN LÁ',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'NÓN LÁ',
    title: 'NÓN LÁ — Xem phim online',
    description: 'Khám phá phim bộ, phim lẻ, chiếu rạp và anime trên NÓN LÁ.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#120b09] text-[#f3ead9] antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
