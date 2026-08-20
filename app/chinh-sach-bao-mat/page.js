import Link from 'next/link';

export const metadata = { title: 'Chính sách bảo mật — NÓN LÁ' };

export default function PrivacyPage() {
  return <main className="min-h-screen bg-[#120b09] px-4 pb-16 pt-28 text-[#f3ead9] md:px-8"><article className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[.025] p-6 md:p-10"><div className="font-display text-4xl text-[#d9a94d]">Chính sách bảo mật</div><div className="mt-6 space-y-5 text-sm leading-7 text-[#ab9985]"><p>NÓN LÁ hạn chế thu thập dữ liệu không cần thiết và ưu tiên dữ liệu tối thiểu để vận hành dịch vụ.</p><p>Thông tin cấu hình bí mật như khóa cron và thông tin kết nối cơ sở dữ liệu phải được lưu bằng biến môi trường trên hệ thống triển khai, không đưa vào mã nguồn.</p><p>Dịch vụ bên thứ ba có thể có chính sách riêng đối với dữ liệu truy cập. Người dùng nên xem chính sách của các dịch vụ đó khi được chuyển tiếp hoặc nhúng nội dung.</p><p>Nếu có thay đổi quan trọng về cách xử lý dữ liệu, trang này sẽ được cập nhật.</p></div><Link href="/" className="mt-8 inline-flex rounded-full bg-[#d9a94d] px-5 py-2.5 text-sm font-extrabold text-[#160e08]">Về trang chủ</Link></article></main>;
}
