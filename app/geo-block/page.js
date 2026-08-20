export default function GeoBlockedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#141414] px-5 text-center text-white">
      <div className="w-full max-w-lg rounded-xl border border-[#333] bg-[#181818] p-10 shadow-2xl">
        <div className="mb-4 text-5xl">⛔</div>
        <h1 className="mb-3 text-3xl font-black text-[#e50914]">Truy Cập Bị Từ Chối</h1>
        <p className="text-sm leading-7 text-[#ccc]">Xin lỗi, dịch vụ xem phim NÓN LÁ hiện tại chỉ hỗ trợ người dùng tại khu vực Việt Nam.</p>
      </div>
    </main>
  );
}
