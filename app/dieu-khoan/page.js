import Link from 'next/link';

export const metadata = { title: 'Điều khoản sử dụng — NÓN LÁ' };

export default function TermsPage() {
  return <main className="min-h-screen bg-[#120b09] px-4 pb-16 pt-28 text-[#f3ead9] md:px-8"><article className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[.025] p-6 md:p-10"><div className="font-display text-4xl text-[#d9a94d]">Điều khoản sử dụng</div><div className="mt-6 space-y-5 text-sm leading-7 text-[#ab9985]"><p>Vui lòng sử dụng NÓN LÁ phù hợp với pháp luật và quy định áp dụng tại nơi bạn truy cập dịch vụ.</p><p>Nội dung, nguồn phát và trạng thái khả dụng có thể thay đổi theo nhà cung cấp bên thứ ba. NÓN LÁ không đảm bảo mọi nguồn phát luôn hoạt động hoặc có cùng chất lượng.</p><p>Không sử dụng dịch vụ để thực hiện hành vi gây ảnh hưởng đến hệ thống, cố ý vượt giới hạn truy cập hoặc phát tán nội dung trái pháp luật.</p><p>Các tính năng và điều khoản có thể được cập nhật khi hệ thống thay đổi.</p></div><Link href="/" className="mt-8 inline-flex rounded-full bg-[#d9a94d] px-5 py-2.5 text-sm font-extrabold text-[#160e08]">Về trang chủ</Link></article></main>;
}
