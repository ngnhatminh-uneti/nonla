# NÓN LÁ

Website xem phim online bằng Next.js App Router, tập trung vào trải nghiệm điện ảnh, responsive UI, tốc độ tải và khả năng phục hồi khi nguồn dữ liệu bên ngoài gặp lỗi.

## Nguồn dữ liệu phim

NÓN LÁ hiện chỉ tích hợp đúng 3 nguồn:

- **KKPhim** — nguồn dữ liệu của homepage và fallback chính.
- **NguonC** — được ưu tiên khi slug từ KKPhim được đối chiếu bằng **tên gốc + năm phát hành**.
- **VSMov** — nguồn vệ tinh/fallback thứ ba, dò theo slug hoặc tên + năm.

Không còn tích hợp API, image host hoặc crawler của OPhim.

## Tính năng chuyển từ `index.html`

- Header legacy: logo, dropdown Thể Loại / Quốc Gia / Danh sách, search suggestion, room code, Tải App, Firebase auth và menu admin.
- Firebase Authentication + Firestore theo project `nonla-phim`.
- `users/{uid}/history` cho **Đang xem / Xem tiếp** và tiến độ tập.
- `users/{uid}/favorites` cho **Yêu thích**.
- `rooms/{roomCode}` cho **Phòng xem chung**, đồng bộ tập, play/pause và thời gian giữa host/guest.
- Player frame **16:9**, HLS/native playback, iframe fallback và hotkeys `Space/K`, `J/L`, `N/P`, `M`, `F`, `X`, `↑/↓`.
- Quảng cáo Firebase 6 zone: `home_top`, `movie_bottom`, `side_left`, `side_right`, `pause_ad`, `popup_ad`.
- Admin quảng cáo cho tài khoản `nghienphim26@gmail.com`.
- Geo gate chỉ cho phép Việt Nam ở client (`api.country.is`) và kiểm tra country headers ở middleware.
- Hai khối Top Phim Bộ / Top Phim Lẻ ở sidebar dùng `position: sticky` và giới hạn chiều cao, nên không trôi khỏi viewport khi cuộn trang.

## Chạy local

```bash
npm ci
npm run dev
```

Mở `http://localhost:3000`.

## Biến môi trường

Copy `.env.example` thành `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEO_STRICT=true
MONGODB_URI=
CRON_SECRET=
```

`CRON_SECRET` là bắt buộc khi gọi `POST /api/crawler`.

## Firebase rules

Repository có `firebase.json` + `firestore.rules` để giới hạn:

- `users`: chỉ chính chủ tài khoản;
- `rooms`: chỉ tài khoản đăng nhập được đọc/tạo, chủ phòng mới được cập nhật/xóa;
- `ads`: đọc công khai, chỉ email admin mới được ghi.

Deploy bằng Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

## Kiểm tra production

```bash
npm run lint
npm audit --audit-level=high
npm run build
npm start
```

GitHub Actions workflow trong `.github/workflows/ci.yml` đã được cấu hình cho lint, dependency audit, production build và CodeQL.
