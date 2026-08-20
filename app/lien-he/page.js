import Link from 'next/link';

export const metadata = { title: 'Liên hệ — NÓN LÁ', description: 'Kênh liên hệ và hỗ trợ NÓN LÁ.' };

export default function ContactPage() {
  return <main className="min-h-screen bg-[#120b09] px-4 pb-16 pt-28 text-[#f3ead9] md:px-8"><div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[.025] p-6 md:p-10"><div className="font-display text-4xl text-[#d9a94d]">Liên hệ & hỗ trợ</div><p className="mt-6 text-sm leading-7 text-[#ab9985]">Khi gặp lỗi đường dẫn, nguồn phát hoặc nội dung, hãy ghi rõ tên phim, URL trang và mô tả ngắn về vấn đề để việc xử lý nhanh hơn.</p><div className="mt-8 rounded-2xl border border-[#d9a94d]/15 bg-[#d9a94d]/5 p-5"><div className="text-sm font-bold text-white">Kênh hỗ trợ</div><p className="mt-2 text-sm text-[#ab9985]">Trang hỗ trợ này là nơi chuẩn bị để tích hợp email hoặc hệ thống ticket. Không nên gửi thông tin bí mật, mật khẩu hoặc khóa API vào yêu cầu hỗ trợ.</p></div><Link href="/" className="mt-8 inline-flex rounded-full bg-[#d9a94d] px-5 py-2.5 text-sm font-extrabold text-[#160e08]">Về trang chủ</Link></div></main>;
}
