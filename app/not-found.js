import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <section className="w-full max-w-xl rounded-3xl border border-white/[.08] bg-white/[.03] p-8 text-center shadow-2xl backdrop-blur md:p-12">
        <div className="font-display text-7xl leading-none text-[#d9a94d]">404</div>
        <h1 className="mt-5 text-2xl font-black text-white md:text-3xl">Trang không tồn tại</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8f7b69]">
          Đường dẫn này không còn tồn tại hoặc nội dung chưa được cập nhật trên NÓN LÁ.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center rounded-full bg-[#d9a94d] px-6 text-sm font-extrabold text-[#160e08] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
