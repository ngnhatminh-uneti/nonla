'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirebase } from './FirebaseProvider';

function Row({ title, icon, items, onRemove, progress }) {
  if (!items.length) return null;
  return (
    <section className="rounded-xl border border-white/5 bg-white/[.02] p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-white"><span className="mr-2 text-[#e50914]">{icon}</span>{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
        {items.map((item) => {
          const pct = progress ? Math.max(Number(item.percent) || 0, 5) : 0;
          return (
            <div key={item.slug} className="group relative w-[120px] shrink-0 snap-start sm:w-[140px]">
              <Link href={`/watch/${item.slug}`} className="block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-[#34241b] bg-[#241a14]">
                  {item.poster ? <Image src={item.poster} alt={item.name} fill sizes="140px" className="object-cover transition duration-300 group-hover:scale-105" /> : null}
                  {progress && pct > 0 && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20"><div className="h-full bg-[#e50914]" style={{ width: `${pct}%` }} /></div>}
                </div>
                <div className="mt-2 truncate text-xs font-bold text-white group-hover:text-[#d9a94d]">{item.name}</div>
                {progress && item.epName && <div className="mt-0.5 truncate text-[10px] text-[#777]">{item.epName}</div>}
              </Link>
              {onRemove && <button type="button" onClick={() => onRemove(item.slug)} className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-[#e50914]" aria-label="Xóa">×</button>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function UserRows() {
  const { user, db, ready } = useFirebase();
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    async function load() {
      if (user && db) {
        try {
          const [h, f] = await Promise.all([
            db.collection('users').doc(user.uid).collection('history').orderBy('timestamp', 'desc').limit(15).get(),
            db.collection('users').doc(user.uid).collection('favorites').orderBy('timestamp', 'desc').get(),
          ]);
          if (!active) return;
          setHistory(h.docs.map((doc) => ({ ...doc.data(), poster: doc.data().full_poster || doc.data().poster_url })));
          setFavorites(f.docs.map((doc) => ({ ...doc.data(), poster: doc.data().full_poster || doc.data().poster_url })));
          return;
        } catch (error) {
          console.warn('[Firebase rows]', error);
        }
      }
      try {
        const h = JSON.parse(localStorage.getItem('nonla_history') || '[]');
        const f = JSON.parse(localStorage.getItem('nonla_favs') || '[]');
        if (active) { setHistory(h); setFavorites(f); }
      } catch {}
    }
    load();
    return () => { active = false; };
  }, [db, ready, user]);

  async function removeHistory(slug) {
    if (user && db) await db.collection('users').doc(user.uid).collection('history').doc(slug).delete().catch(() => {});
    setHistory((items) => items.filter((item) => item.slug !== slug));
    try { localStorage.setItem('nonla_history', JSON.stringify(history.filter((item) => item.slug !== slug))); } catch {}
  }

  if (!ready || (!history.length && !favorites.length)) return null;
  return (
    <div className="mb-8 flex flex-col gap-5" suppressHydrationWarning>
      <Row title="Đang xem" icon="◷" items={history} progress onRemove={removeHistory} />
      <Row title="Yêu thích" icon="♥" items={favorites} />
    </div>
  );
}
