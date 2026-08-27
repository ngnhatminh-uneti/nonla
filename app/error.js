'use client';

export default function Error({ error, reset }) {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-[#120b09] px-6 text-center">
      <section className="max-w-lg rounded-3xl border border-white/[.08] bg-white/[.03] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#b23838]/15 text-2xl text-[#d9a94d]">!</div>
        <h1 className="mt-5 text-2xl font-black text-white">Có lỗi khi tải nội dung</h1>
        <p className="mt-3 text-sm leading-6 text-[#8f7b69]">Một phần nội dung chưa thể hiển thị. Bạn có thể thử tải lại trang.</p>
        <button type="button" onClick={() => reset()} className="mt-6 rounded-full bg-[#d9a94d] px-6 py-3 text-sm font-extrabold text-[#160e08] transition hover:-translate-y-0.5 hover:bg-[#efc66e]">
          Thử lại
        </button>
        {error?.digest && <p className="mt-4 text-[10px] text-[#5f5147]">Mã lỗi: {error.digest}</p>}
      </section>
    </main>
  );
}
