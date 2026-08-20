# NÓN LÁ — Premium Movie UI

NÓN LÁ là ứng dụng Next.js App Router cho trải nghiệm khám phá và xem phim với giao diện cinematic, responsive và tối ưu dần theo từng phase.

## Development

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Environment

Tạo `.env.local` cho môi trường local. Các secret/database credential phải nằm ngoài Git.

```env
MONGODB_URI=...
CRON_SECRET=...
```

`CRON_SECRET` được dùng để bảo vệ `POST /api/crawler`. Request hợp lệ phải gửi:

```http
Authorization: Bearer <CRON_SECRET>
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Architecture notes

- App Router và Server Components được ưu tiên cho các trang dữ liệu.
- `next/image` được dùng cho các ảnh giao diện quan trọng.
- API crawler có timeout, xác thực secret và không trả chi tiết exception ra client.
- Response security headers được cấu hình trong `next.config.mjs`.

## Branching

Các thay đổi nâng cấp được phát triển trên branch feature/copy trước khi merge vào branch UI chính.