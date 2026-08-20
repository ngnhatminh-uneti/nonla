'use client';

import { useEffect, useState } from 'react';

export default function VietnamOnlyGate({ children }) {
  const [state, setState] = useState('checking');

  useEffect(() => {
    let active = true;
    fetch('https://api.country.is/', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Geo API failed');
        return response.json();
      })
      .then((data) => {
        if (active) setState(data?.country === 'VN' ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (active) setState('denied');
      });
    return () => { active = false; };
  }, []);

  if (state === 'allowed') return children;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-[#141414] px-5 text-center" role="alert" aria-live="assertive">
      <div className="w-full max-w-lg rounded-xl border border-[#333] bg-[#181818] p-8 shadow-2xl md:p-10">
        <div className="mb-4 text-4xl">{state === 'checking' ? '◉' : '⛔'}</div>
        <h1 className={`mb-3 text-2xl font-black md:text-3xl ${state === 'checking' ? 'text-[#f5c518]' : 'text-[#e50914]'}`}>
          {state === 'checking' ? 'Đang kiểm tra khu vực…' : 'Truy Cập Bị Từ Chối'}
        </h1>
        <p className="text-sm leading-6 text-[#ccc]">
          {state === 'checking'
            ? 'Vui lòng chờ trong giây lát.'
            : 'Xin lỗi, dịch vụ xem phim NÓN LÁ hiện tại chỉ hỗ trợ người dùng tại khu vực Việt Nam.'}
        </p>
      </div>
    </div>
  );
}
