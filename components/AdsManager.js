'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFirebase } from './FirebaseProvider';

const ZONES = [
  ['home_top', 'Dưới Slider Trang Chủ'],
  ['movie_bottom', 'Dưới Video Phim'],
  ['side_left', 'Banner Dọc Bên Trái'],
  ['side_right', 'Banner Dọc Bên Phải'],
  ['pause_ad', 'Quảng Cáo Khi Tạm Dừng'],
  ['popup_ad', 'Quảng Cáo Popup (Giữa Màn Hình)'],
];

function AdMarkup({ ad, className = '' }) {
  if (!ad) return null;
  if (ad.html) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: ad.html }} />;
  }
  if (!ad.img) return null;
  const image = <img src={ad.img} alt="Quảng cáo" className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl" />;
  return ad.link ? <a href={ad.link} target="_blank" rel="noreferrer noopener">{image}</a> : image;
}

export function AdSlot({ zone, className = '' }) {
  const { db, ready } = useFirebase();
  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!ready || !db) return undefined;
    let active = true;
    const unsubscribe = db.collection('ads').doc(zone).onSnapshot((snapshot) => {
      if (!active) return;
      const list = snapshot.exists ? snapshot.data()?.list : [];
      setAds(Array.isArray(list) ? list : []);
      setIndex(0);
    }, () => active && setAds([]));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [db, ready, zone]);

  useEffect(() => {
    if (ads.length <= 1) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % ads.length), 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (!ads.length) return null;
  const ad = ads[index];

  if (zone === 'side_left' || zone === 'side_right') {
    return <div className={`fixed top-[120px] z-[50] hidden w-[160px] xl:block ${zone === 'side_left' ? 'left-[10px]' : 'right-[10px]'} ${className}`}><AdMarkup ad={ad} /></div>;
  }

  return (
    <div className={`relative mx-auto my-5 flex min-h-[90px] w-full max-w-[1200px] items-center justify-center overflow-hidden rounded-lg ${className}`}>
      <AdMarkup ad={ad} />
    </div>
  );
}

export function GlobalAds() {
  const { db, ready } = useFirebase();
  const [popup, setPopup] = useState([]);
  const [popupIndex, setPopupIndex] = useState(0);

  useEffect(() => {
    if (!ready || !db || typeof window === 'undefined') return undefined;
    let active = true;
    const unsubscribe = db.collection('ads').doc('popup_ad').onSnapshot((snapshot) => {
      if (!active) return;
      const list = snapshot.exists ? snapshot.data()?.list : [];
      setPopup(Array.isArray(list) ? list : []);
    }, () => active && setPopup([]));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [db, ready]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (popup.length <= 1) return undefined;
    const timer = setInterval(() => setPopupIndex((value) => (value + 1) % popup.length), 5000);
    return () => clearInterval(timer);
  }, [popup.length]);

  useEffect(() => {
    if (!popup.length || typeof window === 'undefined') return;
    if (sessionStorage.getItem('nonla_popup_shown')) return;
    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('nonla_popup_shown', 'true');
    }, 1200);
    return () => clearTimeout(timer);
  }, [popup.length]);

  if (!open || !popup.length) return null;
  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg" role="dialog" aria-modal="true">
      <div className="relative flex w-full max-w-[600px] justify-center">
        <button type="button" onClick={() => setOpen(false)} className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg transition hover:scale-110">×</button>
        <AdMarkup ad={popup[popupIndex]} />
      </div>
    </div>
  );
}

export default function AdsManager() {
  return <><GlobalAds /><AdSlot zone="side_left" /><AdSlot zone="side_right" /></>;
}

export function AdminAdsPanel({ open, onClose }) {
  const { db, isAdmin, ready } = useFirebase();
  const [lists, setLists] = useState({});
  const [busy, setBusy] = useState(false);
  const [forms, setForms] = useState({});

  const load = useCallback(async () => {
    if (!db || !isAdmin) return;
    const entries = await Promise.all(ZONES.map(async ([zone]) => {
      const snap = await db.collection('ads').doc(zone).get();
      return [zone, Array.isArray(snap.data()?.list) ? snap.data().list : []];
    }));
    setLists(Object.fromEntries(entries));
  }, [db, isAdmin]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  if (!open || !isAdmin) return null;

  const getForm = (zone) => forms[zone] || { img: '', link: '', html: '' };
  const setForm = (zone, value) => setForms((prev) => ({ ...prev, [zone]: { ...getForm(zone), ...value } }));

  async function addAd(zone) {
    const form = getForm(zone);
    if (!form.img && !form.html) return;
    setBusy(true);
    try {
      const ref = db.collection('ads').doc(zone);
      const snap = await ref.get();
      const list = Array.isArray(snap.data()?.list) ? snap.data().list : [];
      list.push({ img: form.img.trim(), link: form.link.trim(), html: form.html, id: Date.now() });
      await ref.set({ list });
      setForm(zone, { img: '', link: '', html: '' });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function deleteAd(zone, id) {
    const next = (lists[zone] || []).filter((item) => item.id !== id);
    await db.collection('ads').doc(zone).set({ list: next });
    setLists((prev) => ({ ...prev, [zone]: next }));
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-[#141414] p-5 text-white md:p-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex items-center justify-between border-b border-[#333] pb-5">
          <h1 className="text-2xl font-black text-[#e50914] md:text-4xl">📢 Quản trị Quảng Cáo CEO</h1>
          <button type="button" onClick={onClose} className="rounded bg-[#333] px-5 py-2 font-bold hover:bg-[#555]">Đóng ×</button>
        </div>
        {!ready ? <div className="py-20 text-center text-[#aaa]">Đang kết nối Firebase…</div> : (
          <div className="grid gap-8 lg:grid-cols-2">
            {ZONES.map(([zone, label], zoneIndex) => {
              const form = getForm(zone);
              return (
                <section key={zone} className="rounded-lg border border-[#333] bg-[#1e1e1e] p-5">
                  <h2 className="mb-5 border-b border-[#333] pb-3 text-lg font-extrabold text-[#f5c518]">{zoneIndex + 1}. {label}</h2>
                  <div className="space-y-2.5">
                    <input value={form.img} onChange={(e) => setForm(zone, { img: e.target.value })} placeholder="Link ảnh quảng cáo tĩnh (Tùy chọn)" className="w-full rounded bg-black px-3 py-2 text-sm outline-none ring-1 ring-[#444] focus:ring-[#e50914]" />
                    <input value={form.link} onChange={(e) => setForm(zone, { link: e.target.value })} placeholder="Link đích khi click (Tùy chọn)" className="w-full rounded bg-black px-3 py-2 text-sm outline-none ring-1 ring-[#444] focus:ring-[#e50914]" />
                    <div className="py-1 text-center text-xs font-bold text-[#666]">--- HOẶC ---</div>
                    <textarea value={form.html} onChange={(e) => setForm(zone, { html: e.target.value })} placeholder="Dán mã HTML..." className="min-h-[100px] w-full rounded bg-black px-3 py-2 font-mono text-sm outline-none ring-1 ring-[#444] focus:ring-[#e50914]" />
                    <button type="button" disabled={busy} onClick={() => addAd(zone)} className="w-full rounded bg-[#e50914] px-3 py-2 font-bold transition hover:bg-[#b00710] disabled:opacity-50">+ Thêm Quảng Cáo</button>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead><tr><th className="border border-[#444] bg-black p-2 text-left text-[#aaa]">Nội dung</th><th className="border border-[#444] bg-black p-2 text-left text-[#aaa]">Link</th><th className="border border-[#444] bg-black p-2 text-left text-[#aaa]">Hành động</th></tr></thead>
                      <tbody>
                        {(lists[zone] || []).map((ad) => (
                          <tr key={ad.id}>
                            <td className="border border-[#444] p-2">{ad.html ? <span className="rounded bg-[#00b4d8] px-2 py-1 text-xs font-bold text-black">MÃ HTML / SCRIPT</span> : <img src={ad.img} alt="" className="max-h-[70px] max-w-[120px] rounded object-contain" />}</td>
                            <td className="border border-[#444] p-2">{ad.link ? <a className="text-[#00b4d8]" href={ad.link} target="_blank" rel="noreferrer">Xem link</a> : '—'}</td>
                            <td className="border border-[#444] p-2"><button type="button" onClick={() => deleteAd(zone, ad.id)} className="rounded bg-[#e50914] px-2.5 py-1 font-bold">Xóa</button></td>
                          </tr>
                        ))}
                        {!lists[zone]?.length && <tr><td colSpan="3" className="border border-[#444] p-4 text-center text-[#777]">Chưa có quảng cáo.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
