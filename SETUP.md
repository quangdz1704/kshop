# Hướng dẫn Setup KShop

## Bước 1: Cài đặt dependencies

```bash
npm install
```

## Bước 2: Tạo file .env

Tạo file `.env` trong thư mục gốc với nội dung:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# MoMo Payment (tùy chọn - có thể để trống để test)
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_ENVIRONMENT=sandbox

# Facebook Messenger (tùy chọn)
NEXT_PUBLIC_FB_PAGE_ID=your-facebook-page-id
```

**Lưu ý**: Tạo `NEXTAUTH_SECRET` bằng cách chạy:

```bash
openssl rand -base64 32
```

## Bước 3: Khởi tạo database

```bash
# Tạo database, tables và generate Prisma Client (Prisma 7)
npm run db:push

# Seed dữ liệu mẫu (tạo admin user và sản phẩm)
npm run db:seed
```

> Dự án dùng **Prisma 7**: `DATABASE_URL` cấu hình trong `.env`, connection URL cho CLI nằm ở `prisma.config.ts`.
> Nếu `DATABASE_URL` bắt đầu bằng `postgres://` hoặc `postgresql://`, Prisma sẽ dùng `prisma/schema.postgres.prisma`. Nếu là `file:`, Prisma dùng SQLite local qua `prisma/schema.prisma`.

## PostgreSQL production

Khi deploy production, set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
# Nếu provider có pooled URL và direct URL, app dùng DATABASE_URL, CLI migration dùng DIRECT_URL.
# DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-strong-secret"
MOMO_ENVIRONMENT=production
```

Chạy migration production:

```bash
npm run db:migrate:deploy
npm run db:generate
```

Tạo migration PostgreSQL lần đầu trên máy có `DATABASE_URL` trỏ tới PostgreSQL:

```bash
npm run db:migrate -- --name init_postgres
```

## Bước 4: Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Tài khoản mặc định

Sau khi chạy seed, bạn có thể đăng nhập với:

**Admin:**

- Email: `admin@kshop.com`
- Password: `admin123`

**User:**

- Email: `user@kshop.com`
- Password: `user123`

## Các lệnh hữu ích

```bash
# Xem database trong Prisma Studio
npm run db:studio

# Tạo migration mới
npm run db:migrate

# Build cho production
npm run build

# Chạy production server
npm start
```

## Troubleshooting

### Lỗi Prisma Client chưa được generate

```bash
npm run db:generate
```

### Lỗi database chưa được tạo

```bash
npm run db:push
```

### Reset database (xóa tất cả dữ liệu)

Xóa file `dev.db` và chạy lại:

```bash
npm run db:push
npm run db:seed
```
