'use client';
import { useState } from 'react';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';

export default function WatchClient({ movie }) {
  const uniqueSources = [...new Set(movie.servers.map(s => s.sourceName))];
  const [activeSource, setActiveSource] = useState(uniqueSources[0]);
  const [activeServer, setActiveServer] = useState(0);
  const [activeEpisode, setActiveEpisode] = useState(0);

  const currentSourceServers = movie.servers.filter(s => s.sourceName === activeSource);
  const currentServerData = currentSourceServers[activeServer];
  const currentEpLink = currentServerData?.episodes[activeEpisode]?.link;

  return (
    <div className="min-h-screen bg-[#150d0a] text-[#f3ead9] pb-16 pt-24 font-['Inter']">
      
      <div className="px-6 md:px-12 max-w-[1500px] mx-auto">
        {/* Khung phát Video */}
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-[#34241b] mb-10">
          {currentEpLink ? (
            <VideoPlayer key={currentEpLink} src={currentEpLink} />
          ) : (
            <div className="flex items-center justify-center h-full text-[#6e5c4c]">Đang tải luồng phát...</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
          <div className="min-w-0">
            <h1 className="text-4xl md:text-[2.8rem] font-display text-[#f3ead9] mb-3 leading-tight tracking-wide drop-shadow-md">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap gap-3 mb-6 text-[13px] font-semibold">
              <span className="bg-[#b23838] text-white px-3 py-1 rounded shadow-sm">🔥 HOT</span>
              <span className="bg-[#1d130f] border border-[#34241b] text-[#d9a94d] px-3 py-1 rounded">Năm: {movie.year}</span>
              <span className="bg-[#1d130f] border border-[#34241b] text-[#ab9985] px-3 py-1 rounded">{movie.quality || 'FHD'}</span>
            </div>

            <div className="text-[#ab9985] leading-relaxed mb-10 text-[15px] border-l-2 border-[#d9a94d] pl-4">
              {movie.description?.replace(/<[^>]*>?/gm, '')}
              {/* THÊM ĐOẠN NÀY DƯỚI MOVIE.DESCRIPTION */}
            {movie.peoples && (
              <div className="mb-10 bg-[#1d130f] border border-[#34241b] rounded-xl p-5">
                {movie.peoples.directors && movie.peoples.directors.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[#d9a94d] font-bold mr-2">Đạo diễn:</span>
                    <span className="text-[#f3ead9] font-semibold">{movie.peoples.directors.map(d => d.name).join(', ')}</span>
                  </div>
                )}
                {movie.peoples.casts && movie.peoples.casts.length > 0 && (
                  <div>
                    <span className="text-[#d9a94d] font-bold mb-2 block">Diễn viên chính:</span>
                    <div className="flex flex-wrap gap-2">
                      {movie.peoples.casts.slice(0, 8).map((cast, idx) => (
                        <div key={idx} className="bg-[#241a14] border border-[#34241b] rounded-full px-3 py-1.5 text-xs font-semibold text-[#ab9985] flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-[#b23838]"></span> {cast.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* KẾT THÚC ĐOẠN THÊM */}
            </div>

            {/* Block Chọn Nguồn & Tập */}
            <div className="bg-[#1d130f] border border-[#34241b] rounded-xl p-6 mb-8">
              <h3 className="font-display text-[1.3rem] text-[#d9a94d] mb-4">1. Chọn Nguồn Phát</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {uniqueSources.map((source, idx) => (
                  <button key={idx} onClick={() => { setActiveSource(source); setActiveServer(0); setActiveEpisode(0); }}
                    className={`px-4 py-2 rounded font-bold text-[13px] transition-colors border ${activeSource === source ? 'bg-[#d9a94d] text-[#1d130a] border-[#d9a94d]' : 'bg-[#241a14] text-[#ab9985] border-[#34241b] hover:border-[#7a5c28]'}`}>
                    {source}
                  </button>
                ))}
              </div>

              <h3 className="font-display text-[1.3rem] text-[#d9a94d] mb-4">2. Chọn Định Dạng (Server)</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {currentSourceServers.map((srv, idx) => (
                  <button key={idx} onClick={() => { setActiveServer(idx); setActiveEpisode(0); }}
                    className={`px-4 py-2 rounded font-bold text-[13px] transition-colors border ${activeServer === idx ? 'bg-[#b23838] text-white border-[#b23838]' : 'bg-[#241a14] text-[#ab9985] border-[#34241b] hover:border-[#7a5c28]'}`}>
                    {srv.serverName}
                  </button>
                ))}
              </div>

              <h3 className="font-display text-[1.3rem] text-[#d9a94d] mb-4">3. Danh Sách Tập</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {currentServerData?.episodes.map((ep, idx) => (
                  <button key={idx} onClick={() => setActiveEpisode(idx)}
                    className={`px-3 py-2.5 rounded font-semibold text-[14px] flex items-center justify-center transition-colors ${activeEpisode === idx ? 'bg-[#d9a94d] text-[#1d130a]' : 'bg-[#241a14] text-[#ab9985] hover:bg-[#34241b]'}`}>
                    {ep.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Phải Poster */}
          <div className="hidden lg:block w-[320px] shrink-0 sticky top-[100px]">
            <div className="rounded-xl overflow-hidden border border-[#34241b] bg-[#241a14] shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative">
              <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover opacity-90"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                 <button className="w-full bg-[#b23838] text-white py-2.5 rounded font-bold text-[14px] hover:brightness-110 transition">Đánh Giá: 8.5/10</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}