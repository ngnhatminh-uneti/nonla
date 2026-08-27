export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-[#120b09] px-4 py-24 md:px-8" aria-busy="true" aria-label="Đang tải nội dung">
      <div className="mx-auto max-w-[1500px] animate-pulse space-y-6">
        <div className="h-10 w-56 rounded-xl bg-white/[.06]" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] rounded-xl bg-white/[.05]" />
          ))}
        </div>
      </div>
    </div>
  );
}
