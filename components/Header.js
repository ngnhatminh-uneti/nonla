'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from './FirebaseProvider';
import { AdminAdsPanel } from './AdsManager';

const genres = [
  ['Phim Bộ', 'phim-bo'], ['Phim Lẻ', 'phim-le'], ['Phim Mới', 'phim-moi'],
  ['Hoạt Hình', 'hoat-hinh'], ['TV Shows', 'tv-shows'], ['Phim Vietsub', 'phim-vietsub'],
  ['Phim Thuyết Minh', 'phim-thuyet-minh'], ['Phim Lồng Tiếng', 'phim-long-tieng'],
  ['Phim Sắp Chiếu', 'phim-sap-chieu'], ['Phim Chiếu Rạp', 'phim-chieu-rap'],
];
const countries = [['Hàn Quốc', 'han-quoc'], ['Trung Quốc', 'trung-quoc'], ['Nhật Bản', 'nhat-ban'], ['Âu Mỹ', 'au-my'], ['Thái Lan', 'thai-lan'], ['Việt Nam', 'viet-nam']];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, user, auth, db, isAdmin } = useFirebase();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!keyword.trim()) { setSuggestions([]); setSearchLoading(false); return; }
    const controller = new AbortController();
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword.trim())}&page=1`, { signal: controller.signal });
        const json = await res.json();
        let items = json?.data?.items || json?.items || [];
        if (!items.length) {
          const nguon = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword.trim())}`, { signal: controller.signal });
          const data = await nguon.json();
          items = data?.items || [];
        }
        setSuggestions(items.slice(0, 5));
      } catch (error) {
        if (error?.name !== 'AbortError') setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [keyword]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false); setRoomOpen(false); setAdminOpen(false); setAuthOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (pathname.includes('/admin')) return null;

  function goSearch() {
    const q = keyword.trim();
    if (q) router.push(`/tim-kiem?q=${encodeURIComponent(q)}`);
  }

  async function joinRoom() {
    const code = roomCode.trim().toUpperCase();
    if (!code) return;
    if (!db) return;
    try {
      const snap = await db.collection('rooms').doc(code).get();
      if (!snap.exists) {
        setAuthError('Phòng xem chung không tồn tại hoặc đã đóng.');
        return;
      }
      const room = snap.data();
      if (!room?.movieSlug) {
        setAuthError('Phòng không hợp lệ.');
        return;
      }
      setRoomOpen(false);
      setAuthError('');
      router.push(`/watch/${room.movieSlug}?party=${encodeURIComponent(code)}`);
    } catch {
      setAuthError('Không thể kết nối phòng xem chung.');
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthError('Đang xử lý…');
    try {
      if (!auth) throw new Error('Firebase chưa sẵn sàng');
      if (loginMode) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const created = await auth.createUserWithEmailAndPassword(email, password);
        await window.firebase.firestore().collection('users').doc(created.user.uid).set({
          email,
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      setAuthOpen(false); setAuthError(''); setEmail(''); setPassword('');
    } catch (error) {
      console.error(error);
      setAuthError('Thông tin không chính xác hoặc lỗi kết nối.');
    }
  }

  async function logout() {
    await auth?.signOut();
    setAdminOpen(false);
  }

  return (
    <>
      <header suppressHydrationWarning className={`fixed inset-x-0 top-0 z-[1000] px-[4%] py-[15px] transition-all duration-300 ${scrolled ? 'bg-[#141414] shadow-[0_2px_10px_rgba(0,0,0,.5)]' : 'bg-gradient-to-b from-black/95 to-transparent'}`}>
        <div className="flex items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-5 lg:gap-[35px]">
            <Link href="/" className="flex shrink-0 items-center gap-2.5 transition hover:scale-[1.03]" aria-label="NÓN LÁ"><span className="bg-gradient-to-r from-[#a30000] to-[#cca300] bg-clip-text text-[28px] font-black tracking-[2px] text-transparent md:text-[30px]">NÓN LÁ</span></Link>
            <nav className="hidden items-center gap-3 lg:flex xl:gap-6">
              <HeaderDrop title="Thể Loại" items={genres} type="the-loai" />
              <HeaderDrop title="Quốc Gia" items={countries} type="quoc-gia" />
              <HeaderDrop title="Danh sách" items={genres} type="danh-sach" />
            </nav>
          </div>

          <div className="flex items-center gap-2.5 md:gap-4">
            <div className={`relative flex items-center ${searchOpen ? 'active' : ''}`}>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onFocus={() => setSearchOpen(true)} onKeyDown={(e) => e.key === 'Enter' && goSearch()} placeholder="Nhập tên phim..." autoComplete="off" className={`rounded-full border border-white bg-black/70 py-1.5 pl-4 pr-9 text-sm text-white outline-none transition-all duration-300 placeholder:text-[#8f8f8f] ${searchOpen ? 'w-[220px] opacity-100 md:w-[240px]' : 'w-0 border-transparent opacity-0 md:w-0'}`} />
              <button type="button" onClick={() => { setSearchOpen(true); setRoomOpen(false); }} className="absolute right-2.5 z-10 text-white transition hover:scale-110 hover:text-[#e50914]" aria-label="Tìm kiếm">⌕</button>
              {searchOpen && (suggestions.length > 0 || searchLoading) && <div className="absolute right-0 top-[calc(100%+12px)] z-[1000] flex max-h-[450px] w-[320px] flex-col gap-1 overflow-y-auto rounded-xl border border-white/10 bg-[rgba(20,20,20,.92)] p-2.5 shadow-[0_15px_35px_rgba(0,0,0,.9)] backdrop-blur-xl">
                {searchLoading && <div className="p-7 text-center text-sm text-[#aaa]">⌛ Đang tìm kiếm…</div>}
                {!searchLoading && suggestions.map((movie) => <Link key={movie.slug} href={`/watch/${movie.slug}`} onClick={() => { setSearchOpen(false); setKeyword(''); }} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/10 hover:translate-x-1"><img src={movie.poster_url || movie.thumb_url} alt={movie.name} className="h-[65px] w-[45px] shrink-0 rounded-md object-cover" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-white">{movie.name}</div><div className="mt-1 text-xs text-[#aaa]">{movie.quality || 'HD'} • {movie.year || 'Mới'}</div></div></Link>)}
                {!searchLoading && <button type="button" onClick={goSearch} className="mt-1 rounded-lg bg-[#e50914]/80 px-3 py-3 text-sm font-bold text-white hover:bg-[#e50914]">Xem tất cả kết quả →</button>}
              </div>}
            </div>

            {user && <div className="relative flex items-center"><button type="button" onClick={() => { setRoomOpen((value) => !value); setSearchOpen(false); }} className={`mr-1 text-white hover:text-[#e50914] ${roomOpen ? 'text-[#e50914]' : ''}`} title="Tham gia phòng">↪</button>{roomOpen && <div className="absolute right-0 top-[38px] flex flex-col rounded-2xl border border-white/10 bg-black/95 p-2 shadow-xl"><div className="flex rounded-full bg-black p-1"><input autoFocus value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && joinRoom()} placeholder="Mã phòng..." maxLength={10} className="w-[150px] rounded-full border border-white bg-black px-3 py-1.5 text-sm text-white outline-none" /><button type="button" onClick={joinRoom} className="px-2 text-white">→</button></div>{authError && <div className="max-w-[220px] px-2 pt-2 text-xs text-[#e87c03]">{authError}</div>}</div>}</div>}

            <Link href="/tai-app" className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[#3DDC84] hover:bg-white/20 sm:flex"><span className="text-[#3DDC84]">♣</span> Tải App</Link>
            {ready && !user && <button type="button" onClick={() => setAuthOpen(true)} className="rounded bg-[#e50914] px-3.5 py-2 text-sm font-bold text-white transition hover:bg-[#b00710]">Đăng nhập</button>}
            {ready && user && <div className="group relative"><button type="button" className="flex items-center gap-2 text-white"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-sm">◉</span><span className="hidden max-w-[140px] truncate text-sm font-bold md:inline">{user.email}</span>⌄</button><div className="invisible absolute right-0 top-full mt-2 flex min-w-[230px] translate-y-2 flex-col gap-2 rounded-md border border-white/10 bg-black/95 p-3 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"><div className="border-b border-white/10 pb-3 text-xs text-[#aaa] break-all">{user.email}</div>{isAdmin && <button type="button" onClick={() => setAdminOpen(true)} className="flex items-center gap-2 px-1 py-2 text-left text-sm font-bold text-[#f5c518] hover:translate-x-1">⚙ Quản lý Quảng Cáo</button>}<button type="button" onClick={logout} className="flex items-center gap-2 px-1 py-2 text-left text-sm font-bold text-white hover:translate-x-1">↪ Đăng xuất</button></div></div>}
          </div>
        </div>
      </header>

      {authOpen && <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setAuthOpen(false)}><div className="relative w-full max-w-[450px] rounded-xl border border-white/10 bg-black/90 p-8 text-white shadow-[0_15px_50px_rgba(0,0,0,1)] md:p-10"><button type="button" onClick={() => setAuthOpen(false)} className="absolute right-5 top-4 text-2xl text-[#8c8c8c] hover:text-white">×</button><h2 className="mb-6 text-3xl font-black">{loginMode ? 'Đăng Nhập' : 'Đăng Ký'}</h2>{authError && <div className="mb-3 text-center text-sm text-[#e87c03]">{authError}</div>}<form onSubmit={submitAuth} className="flex flex-col gap-3.5"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email của bạn" required className="rounded bg-[#333] p-3.5 text-white outline-none focus:bg-[#444]" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (từ 6 ký tự)" required minLength={6} className="rounded bg-[#333] p-3.5 text-white outline-none focus:bg-[#444]" /><button type="submit" className="mt-2 rounded bg-[#e50914] p-3.5 font-bold hover:bg-[#b00710]">{loginMode ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</button></form><div className="mt-5 text-center text-sm text-[#8c8c8c]">{loginMode ? 'Mới tham gia NÓN LÁ?' : 'Đã có tài khoản?'} <button type="button" onClick={() => { setLoginMode((value) => !value); setAuthError(''); }} className="font-bold text-white hover:underline">{loginMode ? 'Đăng ký ngay.' : 'Đăng nhập.'}</button></div></div></div>}
      <AdminAdsPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}

function HeaderDrop({ title, items, type }) {
  const router = useRouter();
  return <div className="group relative inline-block pb-5 -mb-5"><button type="button" className="flex items-center gap-2 pt-1 text-base font-bold text-[#e5e5e5] transition hover:text-white">{title} <span className="text-[10px] opacity-70">⌄</span></button><div className="invisible absolute left-0 top-full z-[1000] grid max-h-[450px] w-[500px] translate-y-3 grid-cols-3 gap-x-5 gap-y-3 overflow-y-auto rounded-md border border-white/10 bg-black/95 px-6 py-5 opacity-0 shadow-[0_10px_30px_rgba(0,0,0,1)] transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">{items.map(([name, slug]) => <button type="button" key={`${type}-${slug}`} onClick={() => router.push(`/${type}/${slug}`)} className="whitespace-nowrap text-left text-[15px] font-bold text-[#b3b3b3] transition hover:translate-x-1 hover:text-white">{name}</button>)}</div></div>;
}
