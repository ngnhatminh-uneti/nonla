import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'NÓN LÁ - Xem phim online',
  description: 'Website xem phim đỉnh cao đa máy chủ chuẩn SEO.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      {/* THÊM suppressHydrationWarning VÀO THẺ BODY */}
      <body suppressHydrationWarning className="bg-[#150d0a] text-[#f3ead9] min-h-screen flex flex-col antialiased">
        <Header />
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}