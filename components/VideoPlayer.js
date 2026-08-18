'use client';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);

  // Nhận diện xem link có phải là chuẩn m3u8 không
  const isM3U8 = src?.includes('.m3u8');

  useEffect(() => {
    if (!src || !isM3U8) return;

    const video = videoRef.current;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({ debug: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) setError(true);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src; // Dành cho Safari
    }

    return () => {
      if (hls) hls.destroy(); // Xóa bộ nhớ khi chuyển phim
    };
  }, [src, isM3U8]);

  if (!src) return <div className="text-white text-center p-10 flex items-center justify-center h-full">Đang tải video...</div>;

  if (error) return <div className="text-[#e50914] text-center p-10 flex items-center justify-center h-full font-bold">Lỗi: Máy chủ từ chối kết nối. Vui lòng chọn Server khác.</div>;

  // NẾU LÀ LINK EMBED CỦA NGUONC -> DÙNG IFRAME
  if (!isM3U8) {
    return (
      <iframe
        src={src}
        className="w-full h-full border-0 rounded-xl"
        allowFullScreen
        allow="autoplay; fullscreen"
      ></iframe>
    );
  }

  // NẾU LÀ M3U8 -> DÙNG VIDEO TAG VỚI HLS.JS
  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="w-full h-full object-contain bg-black rounded-xl"
    />
  );
}