'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from './FirebaseProvider';
import { AdminAdsPanel } from './AdsManager';

const genres = [
  ['Hành Động', 'hanh-dong'], ['Kinh Dị', 'kinh-di'], ['Cổ Trang', 'co-trang'],
  ['Gia Đình', 'gia-dinh'], ['Hài', 'hai-huoc'], ['Tình Cảm', 'tinh-cam'],
  ['Khoa Học Viễn Tưởng', 'vien-tuong'], ['Phiêu Lưu', 'phieu-luu'], ['Bí Ẩn', 'bi-an'],
  ['Tâm Lý', 'tam-ly'], ['Lịch Sử', 'lich-su'], ['Võ Thuật', 'vo-thuat'],
  ['Âm Nhạc', 'am-nhac'], ['Thể Thao', 'the-thao'], ['Chiến Tranh', 'chien-tranh'],
  ['Kinh Điển', 'kinh-dien'], ['Cổ Điển', 'co-dien'], ['Viễn Tây', 'vien-tay'],
];

const countries = [
  ['Hàn Quốc', 'han-quoc'], ['Trung Quốc', 'trung-quoc'], ['Nhật Bản', 'nhat-ban'],
  ['Âu Mỹ', 'au-my'], ['Thái Lan', 'thai-lan'], ['Việt Nam', 'viet-nam'],
  ['Ấn Độ', 'an-do'], ['Hong Kong', 'hong-kong'], ['Đài Loan', 'dai-loan'],
];

const lists = [
  ['Phim Bộ', 'phim-bo'], ['Phim Lẻ', 'phim-le'], ['Phim Mới', 'phim-moi'],
  ['Hoạt Hình', 'hoat-hinh'], ['TV Shows', 'tv-shows'], ['Phim Vietsub', 'phim-vietsub'],
  ['Phim Thuyết Minh', 'phim-thuyet-minh'], ['Phim Lồng Tiếng', 'phim-long-tieng'],
  ['Phim Sắp Chiếu', 'phim-sap-chieu'], ['Phim Chiếu Rạp', 'phim-chieu-rap'],
];

const getImage = (item) => {
  const raw = item?.thumb_url || item?.poster_url || item?.poster || item?.image || '';
  if (!raw) return 'https://via.placeholder.com/80x110?text=No+Image';
  if (/^https?:\/\//i.test(raw)) return raw;
  const domain = item?.APP_DOMAIN_CDN_IMAGE || item?.cdnDomain || 'https://phimimg.com';
  return `${String(domain).replace(/\/$/, '')}/${String(raw).replace(/^\//, '')}`;
};

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
  const [searchError, setSearchError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);

  const searchTitle = useMemo(() => keyword.trim(), [keyword]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!searchTitle) {
      setSuggestions([]);
      setSearchLoading(false);
      setSearchError('');
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');
      try {
        const kkRes = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(searchTitle)}&page=1`, { signal: controller.signal, cache: 'no-store' });
        const kkJson = await kkRes.json();
        let items = kkJson?.data?.items || kkJson?.items || [];
        const cdn = kkJson?.data?.APP_DOMAIN_CDN_IMAGE || kkJson?.pathImage || 'https://phimimg.com';
        items = items.map((item) => ({ ...item, APP_DOMAIN_CDN_IMAGE: cdn }));

        if (!items.length) {
          const ncRes = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(searchTitle)}`, { signal: controller.signal, cache: 'no-store' });
          const ncJson = await ncRes.json();
          items = (ncJson?.items || []).map((item) => ({ ...item, APP_DOMAIN_CDN_IMAGE: 'https://phim.nguonc.com' }));
        }

        setSuggestions(items.slice(0, 5));
        if (!items.length) setSearchError('Không tìm thấy phim phù hợp!');
      } catch (error) {
        if (error?.name !== 'AbortError') setSearchError('Không thể tìm kiếm lúc này.');
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchTitle]);

  useEffect(() => {
    const handleOutside = (event) => {
      const search = document.getElementById('header-search-box');
      const room = document.getElementById('header-room-box');
      if (search && !search.contains(event.target)) setSearchOpen(false);
      if (room && !room.contains(event.target)) setRoomOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setRoomOpen(false);
        setAuthOpen(false);
        setAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  if (pathname.includes('/admin')) return null;

  const goSearch = () => {
    const q = keyword.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(q)}`);
  };

  const goFilter = (type, slug, name) => {
    router.push(`/danh-sach/${slug}?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`);
  };

  async function joinRoom() {
    const code = roomCode.trim().toUpperCase();
    if (!code) return;
    if (!user || !db) {
      setAuthError('Vui lòng đăng nhập để tham gia phòng xem chung.');
      setAuthOpen(true);
      return;
    }
    try {
      const snap = await db.collection('rooms').doc(code).get();
      if (!snap.exists) {
        setAuthError('Phòng xem chung không tồn tại hoặc đã đóng.');
        return;
      }
      const room = snap.data();
      if (!room?.movieSlug) {
        setAuthError('Mã phòng không hợp lệ.');
        return;
      }
      setRoomOpen(false);
      router.push(`/watch/${room.movieSlug}?party=${encodeURIComponent(code)}`);
    } catch {
      setAuthError('Không thể kết nối phòng xem chung.');
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthError('Đang xử lý…');
    try {
      if (!auth || !db) throw new Error('Firebase chưa sẵn sàng');
      if (loginMode) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const created = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection('users').doc(created.user.uid).set({
          email,
          createdAt: window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
        });
      }
      setAuthOpen(false);
      setAuthError('');
      setEmail('');
      setPassword('');
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
      <header id="header" className={`fixed inset-x-0 top-0 z-[1000] px-[4%] py-[15px] transition-all duration-300 ${scrolled ? 'bg-[#150d0a] shadow-[0_2px_15px_rgba(0,0,0,.65)]' : 'bg-gradient-to-b from-black/95 via-black/50 to-transparent'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="nav-left flex min-w-0 items-center gap-5 lg:gap-[35px]">
            <Link href="/" className="logo-wrapper flex shrink-0 items-center gap-2.5 transition hover:scale-[1.03]" aria-label="NÓN LÁ">
              <img src="/image.png" alt="Logo NÓN LÁ" className="h-9 w-auto object-contain md:h-10" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
              <span className="logo-text bg-gradient-to-r from-[#d9a94d] to-[#b23838] bg-clip-text text-[28px] font-black tracking-[2px] text-transparent md:text-[30px]">NÓN LÁ</span>
            </Link>

            <div className="filters hidden items-center gap-4 lg:flex xl:gap-6">
              <HeaderDrop title="Thể Loại" items={genres} type="the-loai" onSelect={goFilter} />
              <HeaderDrop title="Quốc Gia" items={countries} type="quoc-gia" onSelect={goFilter} />
              <HeaderDrop title="Danh sách" items={lists} type="danh-sach" onSelect={goFilter} />
            </div>
          </div>

          <div className="nav-right flex min-w-0 items-center gap-2 md:gap-3 lg:gap-4">
            <div id="header-search-box" className="search-box relative flex items-center">
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} onFocus={() => setSearchOpen(true)} onKeyDown={(event) => { if (event.key === 'Enter') goSearch(); }} placeholder="Nhập tên phim..." autoComplete="off" className={`h-9 rounded-full border border-white bg-black/70 px-4 pr-10 text-sm text-white outline-none transition-all duration-300 placeholder:text-[#8b7867] ${searchOpen ? 'w-[86vw] max-w-[280px] opacity-100 md:w-[240px]' : 'w-0 border-transparent px-0 opacity-0'}`} />
              <button type="button" onClick={() => { setSearchOpen(true); setRoomOpen(false); }} className="absolute right-2.5 z-[111] flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:scale-110 hover:text-[#b23838]" aria-label="Tìm kiếm">🔍</button>
              {searchOpen && (
                <div className="search-suggestions absolute right-0 top-[calc(100%+12px)] z-[1000] flex max-h-[450px] w-[92vw] max-w-[360px] flex-col gap-1 overflow-y-auto rounded-xl border border-white/10 bg-[rgba(21,13,10,.96)] p-2.5 shadow-[0_15px_35px_rgba(0,0,0,.9)] backdrop-blur-xl md:w-[320px]">
                  {searchLoading && <div className="flex flex-col items-center justify-center gap-2 p-8 text-sm text-[#8f7d6d]"><span className="animate-spin">◌</span><span>Đang tìm kiếm...</span></div>}
                  {!searchLoading && suggestions.map((movie) => (
                    <Link key={movie.slug} href={`/watch/${movie.slug}`} onClick={() => { setSearchOpen(false); setKeyword(''); }} className="suggestion-item flex items-center gap-3 rounded-lg p-2 transition hover:translate-x-1 hover:bg-white/10">
                      <img src={getImage(movie)} alt={movie.name} className="suggestion-img h-[65px] w-[45px] shrink-0 rounded-md object-cover shadow-md" />
                      <div className="suggestion-info min-w-0 flex-1">
                        <div className="suggestion-title line-clamp-2 text-[14px] font-bold text-white">{movie.name || movie.title}</div>
                        <div className="suggestion-meta-row mt-1 flex items-center gap-2 text-[11px] text-[#8f7d6d]"><span className="rounded bg-[#b23838]/15 px-1.5 py-0.5 font-bold text-[#e28b67]">{movie.quality || 'HD'}</span><span>{movie.year || 'Mới'}</span></div>
                      </div>
                    </Link>
                  ))}
                  {!searchLoading && !suggestions.length && searchError && <div className="p-7 text-center text-sm text-[#8f7d6d]">{searchError}</div>}
                  {!searchLoading && searchTitle && <button type="button" onClick={goSearch} className="suggestion-footer mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#b23838] px-3 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#d94444]">Xem tất cả kết quả cho “{searchTitle}” <span>→</span></button>}
                </div>
              )}
            </div>

            {user && (
              <div id="header-room-box" className="room-join-box relative flex items-center">
                <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} onFocus={() => setRoomOpen(true)} onKeyDown={(event) => { if (event.key === 'Enter') joinRoom(); }} placeholder="Mã phòng..." maxLength={10} className={`h-9 rounded-full border border-white bg-black/70 px-4 pr-10 text-sm uppercase text-white outline-none transition-all duration-300 placeholder:text-[#8b7867] ${roomOpen ? 'w-[170px] opacity-100' : 'hidden md:block md:w-[150px] md:opacity-100'}`} />
                <button type="button" onClick={() => { setRoomOpen((value) => !value); setSearchOpen(false); }} title="Tham gia phòng" className="z-[111] text-white transition hover:scale-110 hover:text-[#b23838]">↪</button>
              </div>
            )}

            <Link href="/tai-app" className="download-app-btn hidden h-9 shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[#3DDC84] hover:bg-white/20 sm:flex"><span className="text-[#3DDC84]">♣</span><span>Tải App</span></Link>

            {ready && !user && <button type="button" onClick={() => { setAuthOpen(true); setAuthError(''); }} className="auth-btn shrink-0 rounded bg-[#b23838] px-3.5 py-2 text-sm font-bold text-white transition hover:bg-[#d94444]">Đăng nhập</button>}

            {ready && user && (
              <div className="user-profile group relative flex items-center gap-2">
                <button type="button" className="flex items-center gap-2 text-white" aria-label="Tài khoản"><img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="User" className="h-9 w-9 rounded-md object-cover" /><span className="hidden text-[13px] font-bold md:inline">{user.email}</span><span className="text-xs">▼</span></button>
                <div className="user-profile-menu invisible absolute right-0 top-full z-[1000] mt-2 flex min-w-[230px] translate-y-2 flex-col gap-1 rounded-md border border-white/10 bg-black/95 p-3 opacity-0 shadow-[0_10px_30px_rgba(0,0,0,1)] backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="user-email border-b border-white/10 pb-3 text-xs leading-5 text-[#8f7d6d] break-all">{user.email}</div>
                  {isAdmin && <button type="button" id="admin-menu-btn" onClick={() => setAdminOpen(true)} className="menu-item flex items-center gap-2 px-1 py-2 text-left text-sm font-bold text-[#f5c518] hover:translate-x-1">⚙ Quản lý Quảng Cáo</button>}
                  <button type="button" onClick={logout} className="menu-item flex items-center gap-2 px-1 py-2 text-left text-sm font-bold text-white hover:translate-x-1">↪ Đăng xuất</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex w-full gap-2 overflow-x-auto lg:hidden custom-scrollbar">
          <MobileDrop title="Thể Loại" items={genres} type="the-loai" onSelect={goFilter} />
          <MobileDrop title="Quốc Gia" items={countries} type="quoc-gia" onSelect={goFilter} />
          <MobileDrop title="Danh sách" items={lists} type="danh-sach" onSelect={goFilter} />
        </div>
      </header>

      {authOpen && (
        <div className="auth-modal-overlay fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}>
          <div className="auth-modal relative w-full max-w-[450px] rounded-xl border border-white/10 bg-black/90 p-8 text-white shadow-[0_15px_50px_rgba(0,0,0,1)] md:p-10">
            <button type="button" onClick={() => setAuthOpen(false)} className="auth-close absolute right-5 top-4 text-2xl text-[#8c8c8c] hover:text-white">×</button>
            <h2 className="mb-6 text-3xl font-black">{loginMode ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
            {authError && <div className="mb-3 text-center text-sm text-[#e87c03]">{authError}</div>}
            <form className="auth-form flex flex-col gap-3.5" onSubmit={submitAuth}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email của bạn" required className="rounded bg-[#333] p-3.5 text-white outline-none focus:bg-[#444]" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu (từ 6 ký tự)" required minLength={6} className="rounded bg-[#333] p-3.5 text-white outline-none focus:bg-[#444]" /><button type="submit" className="mt-2 rounded bg-[#b23838] p-3.5 font-bold transition hover:bg-[#d94444]">{loginMode ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</button></form>
            <div className="mt-5 text-center text-sm text-[#8c8c8c]">{loginMode ? 'Mới tham gia NÓN LÁ?' : 'Đã có tài khoản?'} <button type="button" onClick={() => { setLoginMode((value) => !value); setAuthError(''); }} className="font-bold text-white hover:underline">{loginMode ? 'Đăng ký ngay.' : 'Đăng nhập.'}</button></div>
          </div>
        </div>
      )}

      <AdminAdsPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}

function HeaderDrop({ title, items, type, onSelect }) {
  return (
    <div className="custom-dropdown group relative inline-block pb-5 -mb-5">
      <button type="button" className="dropdown-selected flex items-center gap-2 whitespace-nowrap pt-1 text-[15px] font-bold text-[#e5e5e5] transition hover:text-white">{title} <span className="text-[9px] opacity-70">▼</span></button>
      <div className="dropdown-list invisible absolute left-0 top-full z-[1000] grid max-h-[450px] w-[500px] translate-y-3 grid-cols-3 gap-x-5 gap-y-3 overflow-y-auto rounded-md border border-white/10 bg-black/95 px-6 py-5 opacity-0 shadow-[0_10px_30px_rgba(0,0,0,1)] transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {items.map(([name, slug]) => <button key={slug} type="button" onClick={() => onSelect(type, slug, name)} className="dropdown-item whitespace-nowrap text-left text-[14px] font-semibold text-[#b3b3b3] transition hover:translate-x-1 hover:text-[#d9a94d]">{name}</button>)}
      </div>
    </div>
  );
}

function MobileDrop({ title, items, type, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">{title} ▾</button>
      {open && <div className="absolute left-0 top-full z-[1002] mt-2 grid w-[86vw] grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/95 p-3 shadow-2xl">{items.map(([name, slug]) => <button type="button" key={slug} onClick={() => { setOpen(false); onSelect(type, slug, name); }} className="rounded-lg px-2 py-2 text-left text-xs font-semibold text-[#b3b3b3] hover:bg-white/10 hover:text-[#d9a94d]">{name}</button>)}</div>}
    </div>
  );
}
