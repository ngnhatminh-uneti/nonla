import Link from 'next/link';

export const metadata = { title: 'Tải App — NÓN LÁ', description: 'Thông tin ứng dụng NÓN LÁ.' };

export default function AppPage() {
  return <main className="min-h-screen bg-[#120b09] px-4 pb-16 pt-28 text-[#f3ead9] md:px-8"><div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[.025] p-8 text-center md:p-12"><div className="font-display text-5xl text-[#d9a94d]">NÓN LÁ APP</div><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#ab9985]">Ứng dụng native đang được chuẩn bị. Trong thời gian này, website đã được tối ưu để hoạt động tốt trên điện thoại, tablet và desktop.</p><div className="mt-8 inline-flex rounded-full border border-[#d9a94d]/20 bg-[#d9a94d]/5 px-5 py-2.5 text-xs font-bold text-[#d9a94d]">Mobile Web • PWA-ready</div><div><Link href="/" className="mt-8 inline-flex rounded-full bg-[#d9a94d] px-6 py-3 text-sm font-extrabold text-[#160e08]">Xem phim ngay</Link></div></div></main>;
}
