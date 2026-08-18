// utils/api.js

// 1. API TÌM KIẾM PHIM (Ưu tiên NguonC)
export async function searchMoviesAPI(keyword) {
  try {
    const res = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    return data?.items || [];
  } catch (error) {
    console.error("Lỗi tìm kiếm NguonC:", error);
    return [];
  }
}

// 2. API LẤY DANH SÁCH BỘ LỌC (Thể loại & Quốc gia từ KKPhim/OPhim cho đầy đủ)
export async function getFiltersAPI() {
  try {
    const [catRes, counRes] = await Promise.all([
      fetch('https://phimapi.com/the-loai'),
      fetch('https://phimapi.com/quoc-gia')
    ]);
    const categories = await catRes.json();
    const countries = await counRes.json();
    
    return {
      categories: categories || [],
      countries: countries || []
    };
  } catch (error) {
    return { categories: [], countries: [] };
  }
}

// 3. API LẤY THÔNG TIN ĐẠO DIỄN & DIỄN VIÊN (Từ KKPhim hoặc OPhim)
export async function getMoviePeoplesAPI(slug) {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/phim/${slug}/peoples`);
    const data = await res.json();
    // Data trả về thường có casts (diễn viên) và directors (đạo diễn)
    if (data?.status && data?.data) {
      return data.data; 
    }
    return null;
  } catch (error) {
    return null;
  }
}