'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const isHlsSource = (src) => /\.m3u8(?:$|\?)/i.test(src || '');

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || !isHlsSource(src)) return undefined;

    let disposed = false;
    setStatus('loading');
    setError('');

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute('src');
      video.load();
    };

    const startNative = () => {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        if (!disposed) setStatus('ready');
      }, { once: true });
      video.addEventListener('error', () => {
        if (!disposed) {
          setStatus('error');
          setError('Không thể phát luồng video này. Hãy thử nguồn khác.');
        }
      }, { once: true });
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!disposed) setStatus('ready');
      });

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

    return () => {
      disposed = true;
      cleanup();
    };
  }, [src]);

  if (!src) {
    return <div className="flex h-full items-center justify-center bg-black text-sm text-[#6e5c4c]">Chọn một tập để bắt đầu.</div>;
  }

  if (!isHlsSource(src)) {
    return (
      <div className="relative h-full w-full bg-black">
        <iframe
          src={src}
          title="Trình phát video"
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
      />
      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 text-xs font-semibold text-white/80">Đang kết nối máy chủ…</div>
      )}
      {status === 'retrying' && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur">Đang kết nối lại…</div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#080605]/90 px-6 text-center">
          <div className="text-sm font-bold text-[#e28b67]">Không thể phát video</div>
          <div className="max-w-md text-xs leading-5 text-[#9c8a77]">{error}</div>
        </div>
      )}
    </div>
  );
}
