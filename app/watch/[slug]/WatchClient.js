'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import VideoPlayer from '@/components/VideoPlayer';

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export default function WatchClient({ movie }) {
  const sources = useMemo(() => [...new Set(movie?.servers?.map((s) => s.sourceName).filter(Boolean))], [movie?.servers]);
  const [activeSource, setActiveSource] = useState(sources[0] || '');
  const [activeServer, setActiveServer] = useState(0);
  const [activeEpisode, setActiveEpisode] = useState(0);

  const currentSourceServers = useMemo(
    () => movie?.servers?.filter((server) => server.sourceName === activeSource) || [],
    [movie?.servers, activeSource]
  );
  const currentServerData = currentSourceServers[activeServer];
  const currentEpisode = currentServerData?.episodes?.[activeEpisode];
  const description = stripHtml(movie?.description);

  const changeSource = (source) => {
    setActiveSource(source);
    setActiveServer(0);
    setActiveEpisode(0);
  };

  const changeServer = (index) => {
    setActiveServer(index);
    setActiveEpisode(0);
  };

  return (
    <main className="min-h-screen bg-[#120b09] pb-16 pt-[82px] text-[#f3ead9]">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,.45)]">
          <div className="aspect-video w-full">
            <VideoPlayer key={currentEpisode?.link || 'empty'} src={currentEpisode?.link} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
          <section className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl leading-none tracking-wide text-white md:text-6xl">{movie.title}</h1>
                {movie.originalTitle && <p className="mt-2 text-sm text-[#7f6d5d]">{movie.originalTitle}</p>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-extrabold">
                <span className="rounded-full bg-[#b23838] px-3 py-1.5 text-white">{movie.quality || 'FHD'}</span>
                <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[#d9a94d]">{movie.year || 'Mới'}</span>
              </div>
            </div>

            {description && (
              <p className="mt-5 max-w-4xl border-l-2 border-[#d9a94d] pl-4 text-sm leading-7 text-[#ab9985] md:text-[15px]">
                {description}
              </p>
            )}

            {movie.peoples && (movie.peoples.directors?.length > 0 || movie.peoples.casts?.length > 0) && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.025] p-5">
                {movie.peoples.directors?.length > 0 && (
                  <div className="text-sm text-[#bca996]">
                    <span className="font-bold text-[#d9a94d]">Đạo diễn:</span>{' '}
                    {movie.peoples.directors.map((director) => director.name).join(', ')}
                  </div>
                )}
                {movie.peoples.casts?.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 text-sm font-bold text-[#d9a94d]">Diễn viên chính</div>
                    <div className="flex flex-wrap gap-2">
                      {movie.peoples.casts.slice(0, 10).map((cast, index) => (
                        <span key={`${cast.name}-${index}`} className="rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-xs font-semibold text-[#aa9886]">
                          {cast.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#1a100c] p-4 md:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-display text-2xl tracking-wide text-[#d9a94d]">Nguồn phát</div>
                  <div className="mt-1 text-xs text-[#6e5c4c]">Chuyển nguồn khi máy chủ hiện tại gặp vấn đề.</div>
                </div>
                <span className="rounded-full border border-[#d9a94d]/20 bg-[#d9a94d]/5 px-3 py-1 text-[11px] font-bold text-[#d9a94d]">
                  {sources.length} nguồn
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {sources.map((source) => (
                  <button key={source} type="button" onClick={() => changeSource(source)} className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${activeSource === source ? 'bg-[#d9a94d] text-[#160e08]' : 'border border-white/10 bg-white/[.035] text-[#a99785] hover:border-[#d9a94d]/40 hover:text-white'}`}>
                    {source}
                  </button>
                ))}
              </div>

              <div className="mt-7 border-t border-white/10 pt-6">
                <div className="mb-3 text-xs font-extrabold uppercase tracking-[.18em] text-[#7f6d5d]">Server</div>
                <div className="flex flex-wrap gap-2">
                  {currentSourceServers.map((server, index) => (
                    <button key={`${server.serverName}-${index}`} type="button" onClick={() => changeServer(index)} className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${activeServer === index ? 'bg-[#b23838] text-white shadow-lg' : 'border border-white/10 bg-white/[.035] text-[#a99785] hover:text-white'}`}>
                      {server.serverName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 border-t border-white/10 pt-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs font-extrabold uppercase tracking-[.18em] text-[#7f6d5d]">Tập phim</div>
                  {currentServerData?.episodes?.length ? <div className="text-xs text-[#6e5c4c]">{currentServerData.episodes.length} tập</div> : null}
                </div>
                <div className="grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 lg:grid-cols-6 custom-scrollbar">
                  {(currentServerData?.episodes || []).map((episode, index) => (
                    <button key={`${episode.name}-${index}`} type="button" onClick={() => setActiveEpisode(index)} className={`min-h-10 rounded-lg px-3 py-2 text-xs font-bold transition ${activeEpisode === index ? 'bg-[#d9a94d] text-[#160e08]' : 'border border-white/10 bg-white/[.035] text-[#a99785] hover:bg-white/[.07] hover:text-white'}`}>
                      {episode.name || `Tập ${index + 1}`}
                    </button>
                  ))}
                </div>
                {!currentServerData?.episodes?.length && <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-[#6e5c4c]">Nguồn này chưa có tập phát được.</div>}
              </div>
            </div>
          </section>

          <aside className="xl:sticky xl:top-[90px] xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1a100c] shadow-2xl">
              <div className="relative aspect-[2/3]">
                {movie.poster ? (
                  <Image src={movie.poster} alt={movie.title} fill sizes="330px" className="object-cover" />
                ) : <div className="h-full w-full bg-[#21150f]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-[#120b09] via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4">
                  <div className="rounded-xl border border-white/10 bg-black/45 p-4 backdrop-blur-md">
                    <div className="text-xs font-bold text-[#d9a94d]">ĐANG XEM</div>
                    <div className="mt-1 truncate font-bold text-white">{movie.title}</div>
                    <div className="mt-1 text-xs text-[#9c8a77]">{currentEpisode?.name || 'Chọn một tập để bắt đầu'}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
