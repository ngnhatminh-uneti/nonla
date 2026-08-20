# NÓN LÁ

Website xem phim online được xây dựng bằng Next.js App Router, tập trung vào trải nghiệm điện ảnh, responsive UI, tốc độ tải và khả năng phục hồi khi nguồn dữ liệu bên ngoài gặp lỗi.

## Công nghệ

- Next.js 16
- React 19
- Tailwind CSS 4
- HLS.js
- MongoDB / Mongoose

## Nguồn dữ liệu phim

NÓN LÁ hiện chỉ tích hợp 3 nguồn:

- **NguonC** — nguồn ưu tiên khi reverse search từ tên gốc + năm phát hành.
- **KKPhim** — nguồn chính của homepage và fallback khi không tìm thấy phim tương ứng trên NguonC.
- **VSMov** — nguồn vệ tinh/fallback thứ ba, được dò theo slug hoặc tên phim + năm.

Không còn tích hợp API, image host hoặc crawler của OPhim.

## Chạy local

```bash
npm ci
npm run dev
```

Mở `http://localhost:3000`.

## Biến môi trường

Copy `.env.example` thành `.env.local` và cấu hình:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MONGODB_URI=
CRON_SECRET=
```

`CRON_SECRET` là bắt buộc nếu sử dụng `POST /api/crawler`. Endpoint yêu cầu header `Authorization: Bearer <CRON_SECRET>`.

## Kiểm tra production

```bash
npm run lint
npm audit --audit-level=high
npm run build
npm start
```

GitHub Actions tự động chạy lint, dependency audit, production build và CodeQL cho các branch/PR liên quan.

## Cấu trúc chính

- `app/` — App Router, pages, metadata, API route
- `components/` — Header, Hero, movie rows, player và UI dùng lại
- `utils/` — API client và crawler
- `models/` / `lib/` — lớp dữ liệu MongoDB
- `public/` — tài nguyên tĩnh

## Security

Không commit `.env.local` hoặc credentials. Xem `SECURITY.md` để báo cáo lỗ hổng riêng tư.
