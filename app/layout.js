import './globals.css';
import Header from '@/components/Header';
import FirebaseProvider from '@/components/FirebaseProvider';
import AdsManager from '@/components/AdsManager';
import VietnamOnlyGate from '@/components/VietnamOnlyGate';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'NÓN LÁ — Xem là mê', template: '%s | NÓN LÁ' },
  description: 'Khám phá phim bộ, phim lẻ, chiếu rạp và anime trên NÓN LÁ.',
  applicationName: 'NÓN LÁ',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website', locale: 'vi_VN', siteName: 'NÓN LÁ',
    title: 'NÓN LÁ — Xem là mê',
    description: 'Khám phá phim bộ, phim lẻ, chiếu rạp và anime trên NÓN LÁ.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-[#150d0a] text-[#f3ead9] antialiased" suppressHydrationWarning>
        <VietnamOnlyGate>
          <FirebaseProvider>
            <Header />
            <AdsManager />
            <main className="min-h-screen" suppressHydrationWarning>{children}</main>
            <Footer />
          </FirebaseProvider>
        </VietnamOnlyGate>
      </body>
    </html>
  );
}
