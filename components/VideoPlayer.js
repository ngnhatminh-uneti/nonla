'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Hls from 'hls.js';

const isHlsSource = (src) => /\.m3u8(?:$|\?)/i.test(src || '');

const VideoPlayer = forwardRef(function VideoPlayer({ src, onPlayStateChange }, ref) {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const shellRef = useRef(null);
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useImperativeHandle(ref, () => ({
    get media() { return videoRef.current; },
    get iframe() { return iframeRef.current; },
    get shell() { return shellRef.current; },
    get isHls() { return isHlsSource(src); },
  }), [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || !isHlsSource(src)) return undefined;

    let disposed = false;
    setStatus('loading');
    setError('');

    const onPlay = () => onPlayStateChange?.('playing');
    const onPause = () => onPlayStateChange?.('paused');
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    const cleanup = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.removeAttribute('src');
      video.load();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };

    const startNative = () => {
      video.src = src;
      video.addEventListener('loadedmetadata', () => !disposed && setStatus('ready'), { once: true });
      video.addEventListener('error', () => {
        if (!disposed) {
          setStatus('error');
          setError('Không thể phát luồng video này. Hãy thử nguồn khác.');
        }
      }, { once: true });
    };

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false, backBufferLength: 30, maxBufferLength: 30, capLevelToPlayerSize: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => !disposed && setStatus('ready'));
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (disposed || !data?.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('retrying');
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        setStatus('error');
        setError('Máy chủ phát không khả dụng. Hãy thử nguồn khác.');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      startNative();
    } else {
      setStatus('error');
      setError('Trình duyệt này không hỗ trợ HLS.');
    }

    return () => { disposed = true; cleanup(); };
  }, [src, onPlayStateChange]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;

    const onKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)) return;
      if (!shell.matches(':hover') && document.activeElement !== shell) return;

      const media = videoRef.current;
      if (!media) return;
      const key = event.key.toLowerCase();
      const supported = [' ', 'k', 'l', 'j', 'm', 'f', 'x', 'arrowright', 'arrowleft', 'arrowup', 'arrowdown'];
      if (!supported.includes(key)) return;
      event.preventDefault();

      if ((key === ' ' || key === 'k') && !event.repeat) media.paused ? media.play().catch(() => {}) : media.pause();
      if (key === 'l' || key === 'arrowright') media.currentTime = Math.min(media.duration || Infinity, media.currentTime + (key === 'l' ? 10 : 5));
      if (key === 'j' || key === 'arrowleft') media.currentTime = Math.max(0, media.currentTime - (key === 'j' ? 10 : 5));
      if (key === 'm' && !event.repeat) media.muted = !media.muted;
      if (key === 'arrowup') media.volume = Math.min(1, media.volume + 0.1);
      if (key === 'arrowdown') media.volume = Math.max(0, media.volume - 0.1);
      if (key === 'x' && !event.repeat) media.playbackRate = media.playbackRate === 2 ? 1 : 2;
      if (key === 'f' && !event.repeat) {
        if (!document.fullscreenElement) shell.requestFullscreen?.(); else document.exitFullscreen?.();
      }
    };

    shell.addEventListener('keydown', onKeyDown);
    return () => shell.removeEventListener('keydown', onKeyDown);
  }, [src]);

  const focusPlayer = () => shellRef.current?.focus({ preventScroll: true });

  if (!src) return <div ref={shellRef} tabIndex={0} onMouseEnter={focusPlayer} className="watch-player-shell flex h-full items-center justify-center bg-black text-sm text-[#6e5c4c] outline-none">Chọn một tập để bắt đầu.</div>;

  if (!isHlsSource(src)) {
    return (
      <div ref={shellRef} tabIndex={0} onMouseEnter={focusPlayer} className="watch-player-shell relative h-full w-full bg-black outline-none" aria-label="Khung xem phim">
        <iframe ref={iframeRef} src={src} title="Trình phát video" className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" />
      </div>
    );
  }

  return (
    <div ref={shellRef} tabIndex={0} onMouseEnter={focusPlayer} className="watch-player-shell relative h-full w-full bg-black outline-none" aria-label="Khung xem phim">
      <video ref={videoRef} controls playsInline preload="metadata" className="h-full w-full object-contain" />
      {status === 'loading' && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 text-xs font-semibold text-white/80">Đang kết nối máy chủ…</div>}
      {status === 'retrying' && <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur">Đang kết nối lại…</div>}
      {status === 'error' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#080605]/90 px-6 text-center"><div className="text-sm font-bold text-[#e28b67]">Không thể phát video</div><div className="max-w-md text-xs leading-5 text-[#9c8a77]">{error}</div></div>}
    </div>
  );
});

export default VideoPlayer;
