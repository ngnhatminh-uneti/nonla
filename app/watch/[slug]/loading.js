export default function Loading() {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center z-50">
      
      {/* Vòng xoay Loading màu Vàng Gold */}
      <div className="relative w-16 h-16 mb-6">
        {/* Vòng nền mờ */}
        <div className="absolute inset-0 border-4 border-[#34241b] rounded-full"></div>
        {/* Vòng xoay */}
        <div className="absolute inset-0 border-4 border-[#d9a94d] rounded-full border-t-transparent animate-spin"></div>
        {/* Điểm nhấn ở giữa */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-[#b23838] rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Chữ hiển thị */}
      <h2 className="text-[#d9a94d] text-[1.2rem] font-black tracking-widest uppercase mb-2">
        NÓN LÁ
      </h2>
      <p className="text-[#ab9985] text-[13px] animate-pulse tracking-wide">
        Đang dò tìm và tối ưu nguồn phim...
      </p>

    </div>
  );
}