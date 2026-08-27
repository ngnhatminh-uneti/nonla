'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { AdSlot } from '@/components/AdsManager';
import { useFirebase } from '@/components/FirebaseProvider';

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export default function WatchClient({ movie }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, db, ready } = useFirebase();
  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const partyUnsubscribeRef = useRef(null);
  const hostTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  const sources = useMemo(() => [...new Set(movie?.servers?.map((server) => server.sourceName).filter(Boolean))], [movie?.servers]);
  const [activeSource, setActiveSource] = useState(sources[0] || '');
  const [activeServer, setActiveServer] = useState(0);
  const [activeEpisode, setActiveEpisode] = useState(0);
  const [autoNext, setAutoNext] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [partyCode, setPartyCode] = useState('');
  const [partyHost, setPartyHost] = useState(false);
  const [partyInfo, setPartyInfo] = useState(null);
  const [guestWaiting, setGuestWaiting] = useState(false);
  const [toast, setToast] = useState('');
  const [pauseAds, setPauseAds] = useState([]);
  const [showPauseAd, setShowPauseAd] = useState(false);
  const [pauseAdIndex, setPauseAdIndex] = useState(0);
  const [savedHistory, setSavedHistory] = useState(null);

  const currentSourceServers = useMemo(
    () => movie?.servers?.filter((server) => server.sourceName === activeSource) || [],
    [movie?.servers, activeSource]
  );
  const currentServerData = currentSourceServers[activeServer];
  const currentEpisode = currentServerData?.episodes?.[activeEpisode];
  const description = stripHtml(movie?.description);
  const partyCodeFromUrl = searchParams.get('party') || '';

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2500);
  }, []);

  const findEpisode = useCallback((url) => {
    if (!url) return null;
    const grouped = (movie?.servers || []).reduce((acc, server) => {
      (acc[server.sourceName] ||= []).push(server);
      return acc;
    }, {});
    for (const [source, serverList] of Object.entries(grouped)) {
      for (let serverIndex = 0; serverIndex < serverList.length; serverIndex += 1) {
        const episodes = serverList[serverIndex]?.episodes || [];
        for (let episodeIndex = 0; episodeIndex < episodes.length; episodeIndex += 1) {
          if (episodes[episodeIndex]?.link === url) {
            return { source, server: serverIndex, episode: episodeIndex };
          }
        }
      }
    }
    return null;
  }, [movie?.servers]);

  const updateHostRoom = useCallback((state, episodeLink = currentEpisode?.link, time = playerRef.current?.media?.currentTime || 0) => {
    if (!partyCode || !partyHost || !db || !episodeLink) return;
    db.collection('rooms').doc(partyCode).update({
      state,
      time,
      epUrl: episodeLink,
      updatedAt: Date.now(),
    }).catch(() => {});
  }, [currentEpisode?.link, db, partyCode, partyHost]);

  useEffect(() => {
    return () => {
      window.clearInterval(progressTimerRef.current);
      window.clearInterval(hostTimerRef.current);
      window.clearTimeout(toastTimerRef.current);
      partyUnsubscribeRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!ready || !db || !user || !movie?.slug) return;
    db.collection('users').doc(user.uid).collection('favorites').doc(movie.slug).get()
      .then((snap) => setIsFavorite(snap.exists))
      .catch(() => {});
    db.collection('users').doc(user.uid).collection('history').doc(movie.slug).get()
      .then((snap) => snap.exists && setSavedHistory(snap.data()))
      .catch(() => {});
  }, [db, ready, user, movie?.slug]);

  useEffect(() => {
    if (!ready || !db) return undefined;
    return db.collection('ads').doc('pause_ad').onSnapshot((snap) => {
      const list = snap.exists ? snap.data()?.list : [];
      setPauseAds(Array.isArray(list) ? list : []);
    }, () => setPauseAds([]));
  }, [db, ready]);

  useEffect(() => {
    if (!ready || !db || !partyCodeFromUrl || !movie?.slug) return undefined;
    setPartyCode(partyCodeFromUrl.toUpperCase());
    if (!user) {
      setGuestWaiting(true);
      notify('Vui lòng đăng nhập để tham gia Phòng Xem Chung.');
      return undefined;
    }

    let cancelled = false;
    const roomRef = db.collection('rooms').doc(partyCodeFromUrl.toUpperCase());
    roomRef.get().then((snap) => {
      if (cancelled) return;
      if (!snap.exists) {
        notify('Phòng xem chung không tồn tại hoặc đã đóng.');
        return;
      }

      const room = snap.data();
      if (room.movieSlug !== movie.slug) {
        notify('Phòng này đang phát một bộ phim khác.');
        return;
      }

      const host = user.uid === room.hostId;
      setPartyHost(host);
      setPartyInfo(room);
      setGuestWaiting(!host);

      const match = findEpisode(room.epUrl);
      if (match) {
        setActiveSource(match.source);
        setActiveServer(match.server);
        setActiveEpisode(match.episode);
      }

      partyUnsubscribeRef.current = roomRef.onSnapshot((nextSnap) => {
        if (!nextSnap.exists) {
          notify('Chủ phòng đã kết thúc phiên xem chung.');
          router.push(`/watch/${movie.slug}`);
          return;
        }

        const data = nextSnap.data();
        setPartyInfo(data);
        const matchNow = findEpisode(data.epUrl);
        if (matchNow && data.epUrl !== currentEpisode?.link) {
          setActiveSource(matchNow.source);
          setActiveServer(matchNow.server);
          setActiveEpisode(matchNow.episode);
        }

        const media = playerRef.current?.media;
        if (!media || user.uid === data.hostId) return;
        if (data.state === 'playing' && media.paused) media.play().catch(() => {});
        if (data.state === 'paused' && !media.paused) media.pause();
        if (typeof data.time === 'number' && Math.abs(media.currentTime - data.time) > 2) media.currentTime = data.time;
      });
    }).catch(() => notify('Không thể kết nối phòng xem chung.'));

    return () => {
      cancelled = true;
      partyUnsubscribeRef.current?.();
      partyUnsubscribeRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ready, user, partyCodeFromUrl, movie?.slug]);

  useEffect(() => {
    if (!partyHost || !partyCode || !db) return undefined;
    hostTimerRef.current = window.setInterval(() => updateHostRoom('playing'), 5000);
    return () => window.clearInterval(hostTimerRef.current);
  }, [db, partyCode, partyHost, updateHostRoom]);

  const handlePlayState = useCallback((state) => {
    if (state === 'playing') {
      setGuestWaiting(false);
      updateHostRoom('playing');
    }
    if (state === 'paused') {
      if (pauseAds.length) setShowPauseAd(true);
      updateHostRoom('paused');
    }
  }, [pauseAds.length, updateHostRoom]);

  const selectEpisode = useCallback((index, shouldSync = true) => {
    if (index < 0 || index >= (currentServerData?.episodes || []).length) return;
    const nextEpisode = currentServerData.episodes[index];
    setActiveEpisode(index);
    if (shouldSync && partyHost) updateHostRoom('paused', nextEpisode?.link, 0);
  }, [currentServerData, partyHost, updateHostRoom]);

  const handleEnded = useCallback(() => {
    if (!autoNext || guestWaiting) return;
    const nextIndex = activeEpisode + 1;
    if (nextIndex >= (currentServerData?.episodes || []).length) {
      notify('Đã hết tập trong server hiện tại.');
      return;
    }
    selectEpisode(nextIndex, true);
    notify('Đang chuyển sang tập tiếp theo…');
  }, [activeEpisode, autoNext, currentServerData, guestWaiting, notify, selectEpisode]);

  const changeSource = (source) => {
    if (partyCode && !partyHost) return notify('Chỉ Chủ phòng mới có quyền thao tác!');
    setActiveSource(source);
    setActiveServer(0);
    setActiveEpisode(0);
  };

  const changeServer = (index) => {
    if (partyCode && !partyHost) return notify('Chỉ Chủ phòng mới có quyền thao tác!');
    setActiveServer(index);
    setActiveEpisode(0);
  };

  async function toggleFavorite() {
    if (!user || !db) return notify('Vui lòng đăng nhập để dùng Danh sách yêu thích.');
    const ref = db.collection('users').doc(user.uid).collection('favorites').doc(movie.slug);
    const payload = { slug: movie.slug, name: movie.title, poster_url: movie.poster, full_poster: movie.poster, timestamp: Date.now() };
    try {
      if (isFavorite) await ref.delete(); else await ref.set(payload);
      const next = !isFavorite;
      setIsFavorite(next);
      notify(next ? 'Đã thêm vào Danh sách yêu thích.' : 'Đã xóa khỏi Danh sách yêu thích.');
    } catch {
      notify('Không thể cập nhật Danh sách.');
    }
  }

  async function createWatchParty() {
    if (!user || !db) return notify('Bạn cần Đăng nhập để tạo phòng!');
    if (!currentEpisode?.link) return notify('Hãy chọn một tập phim trước khi tạo phòng.');
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const media = playerRef.current?.media;
    try {
      await db.collection('rooms').doc(code).set({
        hostId: user.uid,
        hostEmail: user.email,
        movieSlug: movie.slug,
        epUrl: currentEpisode.link,
        state: media?.paused ? 'paused' : 'playing',
        time: media?.currentTime || 0,
        updatedAt: Date.now(),
      });
      router.push(`/watch/${movie.slug}?party=${code}`);
    } catch {
      notify('Không thể tạo phòng Firebase.');
    }
  }

  function leaveParty() {
    if (partyHost && partyCode && db) db.collection('rooms').doc(partyCode).delete().catch(() => {});
    router.push(`/watch/${movie.slug}`);
  }

  useEffect(() => {
    if (!currentEpisode?.link) return undefined;
    window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = window.setInterval(() => {
      const media = playerRef.current?.media;
      if (!media || !user || !db || !movie.slug) return;
      db.collection('users').doc(user.uid).collection('history').doc(movie.slug).set({
        slug: movie.slug,
        name: movie.title,
        poster_url: movie.poster,
        full_poster: movie.poster,
        epUrl: currentEpisode.link,
        epName: currentEpisode.name,
        currentTime: media.currentTime || 0,
        duration: media.duration || 0,
        percent: media.duration ? Math.min((media.currentTime / media.duration) * 100, 100) : 0,
        timestamp: Date.now(),
      }, { merge: true }).catch(() => {});
    }, 5000);
    return () => window.clearInterval(progressTimerRef.current);
  }, [currentEpisode?.link, currentEpisode?.name, db, movie.slug, movie.poster, movie.title, user]);

  useEffect(() => {
    const media = playerRef.current?.media;
    if (!media || !savedHistory || savedHistory.epUrl !== currentEpisode?.link) return undefined;
    const restore = () => {
      if (savedHistory.currentTime && savedHistory.currentTime < (media.duration || Infinity)) media.currentTime = savedHistory.currentTime;
    };
    media.addEventListener('loadedmetadata', restore, { once: true });
    return () => media.removeEventListener('loadedmetadata', restore);
  }, [currentEpisode?.link, savedHistory]);

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const media = playerRef.current?.media;
      if (!media || guestWaiting) return;
      const key = event.key.toLowerCase();
      const supported = [' ', 'k', 'l', 'j', 'm', 'f', 'x', 'n', 'p', 'arrowright', 'arrowleft', 'arrowup', 'arrowdown'];
      if (!supported.includes(key)) return;
      event.preventDefault();
      if (partyCode && !partyHost) return notify('Chỉ Chủ phòng mới có quyền thao tác!');

      if ((key === ' ' || key === 'k') && !event.repeat) media.paused ? media.play().catch(() => {}) : media.pause();
      if (key === 'n' && !event.repeat) selectEpisode(activeEpisode + 1, true);
      if (key === 'p' && !event.repeat) selectEpisode(activeEpisode - 1, true);
      if (key === 'l' || key === 'arrowright') media.currentTime = Math.min(media.duration || Infinity, media.currentTime + (key === 'l' ? 10 : 5));
      if (key === 'j' || key === 'arrowleft') media.currentTime = Math.max(0, media.currentTime - (key === 'j' ? 10 : 5));
      if (key === 'm' && !event.repeat) media.muted = !media.muted;
      if (key === 'arrowup') media.volume = Math.min(1, media.volume + 0.1);
      if (key === 'arrowdown') media.volume = Math.max(0, media.volume - 0.1);
      if (key === 'x' && !event.repeat) media.playbackRate = media.playbackRate === 2 ? 1 : 2;
      if (key === 'f' && !event.repeat) {
        const shell = document.getElementById('watch-player-frame');
        if (!document.fullscreenElement) shell?.requestFullscreen?.(); else document.exitFullscreen?.();
      }
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, [activeEpisode, guestWaiting, notify, partyCode, partyHost, selectEpisode]);

  const ad = pauseAds[pauseAdIndex];

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#141414] pb-16 pt-[82px] text-[#e5e5e5]">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        {partyInfo && <div className="mb-5 flex flex-col gap-3 rounded-lg border border-[#e50914] bg-[#e50914]/10 p-4 md:flex-row md:items-center md:justify-between"><div><div className="font-bold text-white">📡 Phòng Xem Chung #{partyCode}</div><div className="mt-1 text-sm text-[#ccc]">Chủ phòng: {partyInfo.hostEmail} · {partyHost ? 'CHỦ PHÒNG' : 'KHÁCH'}</div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigator.clipboard?.writeText(partyCode).then(() => notify('Đã sao chép mã phòng.'))} className="rounded border border-white/20 px-3 py-1.5 text-xs font-bold">Copy mã</button><button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => notify('Đã sao chép link phòng.'))} className="rounded border border-white/20 px-3 py-1.5 text-xs font-bold">Copy link</button><button type="button" onClick={leaveParty} className="rounded bg-[#e50914] px-3 py-1.5 text-xs font-bold">Rời phòng</button></div></div>}

        <div id="watch-player-frame" className="relative overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,.8)]" style={{ aspectRatio: '16 / 9' }}>
          <VideoPlayer ref={playerRef} key={currentEpisode?.link || 'empty'} src={currentEpisode?.link} onPlayStateChange={handlePlayState} onEnded={handleEnded} />
          {guestWaiting && partyInfo && <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/85 p-6 text-center backdrop-blur"><div className="text-3xl">📡</div><h3 className="text-xl font-bold text-white">Phòng xem chung đã sẵn sàng!</h3><p className="max-w-md text-sm text-[#aaa]">Chủ phòng đang điều khiển phiên xem. Bấm để tham gia đồng bộ video.</p><button type="button" onClick={() => { setGuestWaiting(false); playerRef.current?.media?.play().catch(() => {}); }} className="rounded-full bg-[#e50914] px-6 py-3 font-bold text-white">Tham gia đồng bộ Video</button></div>}
          {showPauseAd && ad && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-[380px] rounded-lg border border-white/10 bg-[rgba(15,15,15,.96)] p-4 text-center shadow-2xl"><div className="flex min-h-[180px] items-center justify-center">{ad.html ? <div dangerouslySetInnerHTML={{ __html: ad.html }} /> : <img src={ad.img} alt="Quảng cáo" className="max-h-[180px] max-w-full rounded object-contain" />}</div><div className="mt-1 text-xs text-[#888]">Quảng cáo</div><div className="mt-3 flex justify-center gap-3"><button type="button" onClick={() => setShowPauseAd(false)} className="rounded bg-white/20 px-4 py-2 text-sm font-bold">Đóng quảng cáo</button><button type="button" onClick={() => { setShowPauseAd(false); playerRef.current?.media?.play().catch(() => {}); }} className="rounded bg-[#e50914] px-4 py-2 text-sm font-bold">Đóng và xem tiếp</button></div></div></div>}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[.02] px-4 py-2 text-xs text-[#8f8f8f]"><span>Hotkeys: Space/K phát · J/L ±10s · N/P tập · M tiếng · F toàn màn hình · X 2x · ↑/↓ âm lượng</span><span>Player 16:9 · HLS / Iframe fallback</span></div>
        <AdSlot zone="movie_bottom" />

        <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
          <section className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-4xl leading-none tracking-wide text-white md:text-6xl">{movie.title}</h1>{movie.originalTitle && <p className="mt-2 text-sm text-[#7f6d5d]">{movie.originalTitle}</p>}</div><div className="flex flex-wrap gap-2 text-xs font-extrabold"><span className="rounded-full bg-[#b23838] px-3 py-1.5 text-white">{movie.quality || 'FHD'}</span><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[#d9a94d]">{movie.year || 'Mới'}</span></div></div>
            <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={toggleFavorite} className={`rounded-full border px-4 py-2 text-sm font-bold ${isFavorite ? 'border-[#e50914] bg-[#e50914]/10 text-[#e50914]' : 'border-white/10 bg-white/[.03] text-white'}`}>{isFavorite ? '✓ Đã lưu' : '+ Thêm vào Danh Sách'}</button><button type="button" onClick={createWatchParty} className="rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-4 py-2 text-sm font-bold text-white shadow-lg">👥 Tạo phòng xem chung</button><label className="ml-auto flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-bold text-white"><span>Tự động chuyển tập</span><input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} className="accent-[#e50914]" /></label></div>
            {description && <p className="mt-5 max-w-4xl border-l-4 border-[#e50914] bg-white/[.02] px-4 py-4 text-sm leading-7 text-[#d2d2d2]">{description}</p>}
            <div className="mt-8 rounded-xl border border-white/10 bg-[#181818] p-4 md:p-6">
              <h2 className="mb-4 border-b border-white/10 pb-2 text-lg font-bold text-white">Chọn Nguồn Phát</h2>
              <div className="flex flex-wrap gap-2">{sources.map((source) => <button key={source} type="button" onClick={() => changeSource(source)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeSource === source ? 'border-white bg-white text-black shadow-lg' : 'border-white/20 bg-white/[.05] text-[#ccc] hover:bg-white/15'}`}>◉ {source}</button>)}</div>
              <h2 className="mb-4 mt-7 border-b border-white/10 pb-2 text-lg font-bold text-white">Chọn Định Dạng (Server)</h2>
              <div className="flex flex-wrap gap-2">{currentSourceServers.map((server, index) => <button key={`${server.serverName}-${index}`} type="button" onClick={() => changeServer(index)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeServer === index ? 'border-[#e50914] bg-[#e50914] text-white' : 'border-white/20 bg-white/[.05] text-[#ccc] hover:bg-white/15'}`}>▣ {server.serverName}</button>)}</div>
              <h2 className="mb-4 mt-7 border-b border-white/10 pb-2 text-lg font-bold text-white">Danh sách tập phim</h2>
              <div className="grid max-h-[400px] grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar sm:grid-cols-4 lg:grid-cols-6">{(currentServerData?.episodes || []).map((episode, index) => <button key={`${episode.name}-${index}`} type="button" onClick={() => { if (partyCode && !partyHost) { notify('Chỉ Chủ phòng mới có quyền thao tác!'); return; } selectEpisode(index, true); }} className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold transition ${activeEpisode === index ? 'bg-[#e50914] text-white' : 'bg-white/10 text-[#e5e5e5] hover:bg-white/20'}`}>▶ Tập {episode.name}</button>)}</div>
              {!currentServerData?.episodes?.length && <div className="py-8 text-center text-sm text-[#777]">Nguồn này chưa có tập phát được.</div>}
            </div>
          </section>

          <aside className="xl:sticky xl:top-[90px] xl:self-start"><div className="overflow-hidden rounded-xl border border-white/10 bg-[#181818] shadow-2xl"><div className="relative aspect-[2/3]">{movie.poster ? <Image src={movie.poster} alt={movie.title} fill sizes="330px" className="object-cover" /> : <div className="h-full w-full bg-[#222]" />}<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"/><div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/10 bg-black/50 p-4 backdrop-blur"><div className="text-xs font-bold text-[#f5c518]">ĐANG XEM</div><div className="mt-1 truncate font-bold text-white">{movie.title}</div><div className="mt-1 text-xs text-[#999]">{currentEpisode?.name || 'Chọn một tập để bắt đầu'}</div></div></div></div></aside>
        </div>
      </div>
      {toast && <div className="fixed bottom-7 left-1/2 z-[9999] -translate-x-1/2 rounded-full bg-[#46d369] px-5 py-3 text-sm font-bold text-black shadow-2xl">✓ {toast}</div>}
    </main>
  );
}
