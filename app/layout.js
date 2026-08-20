import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'NÓN LÁ — Xem phim online',
  description: 'Khám phá phim bộ, phim lẻ, chiếu rạp và anime trên NÓN LÁ.',
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
