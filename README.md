# KShop - Trang web bán hàng trực tuyến

Trang web bán hàng được xây dựng với Next.js 14, TypeScript, Prisma và PostgreSQL/SQLite.

## Tính năng

- ✅ Trang list sản phẩm với search, filter theo danh mục, phân trang
- ✅ Trang chi tiết sản phẩm
- ✅ Giỏ hàng (thêm, sửa, xóa sản phẩm)
- ✅ Chat với CSKH qua Facebook Messenger Plugin
- ✅ Lưu lịch sử mua hàng và đơn hàng hiện tại
- ✅ Đăng nhập với vai trò: Guest/User/Admin
- ✅ Thanh toán đơn hàng qua MoMo

## Công nghệ sử dụng

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM với SQLite (dev) / PostgreSQL (production)
- **Authentication**: NextAuth.js
- **Payment**: MoMo Payment Gateway
- **Chat**: Facebook Messenger Plugin

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Setup database

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_ENVIRONMENT=sandbox
NEXT_PUBLIC_FB_PAGE_ID=your-facebook-page-id
```

### 3. Khởi tạo database

```bash
npx prisma generate
npx prisma db push
```

### 4. Tạo tài khoản admin (tùy chọn)

Chạy script để tạo admin user:

```bash
npm run db:studio
```

Hoặc tạo trực tiếp trong code:

```typescript
// Tạo file seed.ts và chạy
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@kshop.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
}
```

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Cấu trúc project

```
kshop/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin pages
│   │   ├── auth/              # Authentication pages
│   │   ├── cart/              # Cart page
│   │   ├── checkout/          # Checkout page
│   │   ├── orders/            # Orders page
│   │   └── products/          # Products pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities (Prisma, Auth)
│   └── hooks/                 # Custom hooks
└── package.json
```

## Deploy

### Vercel (Recommended)

1. Push code lên GitHub
2. Import project vào Vercel
3. Thêm các biến môi trường trong Vercel dashboard
4. Deploy!

### Các platform khác

- **Railway**: Hỗ trợ PostgreSQL và deploy Next.js dễ dàng
- **Render**: Free tier cho PostgreSQL và Next.js
- **DigitalOcean App Platform**: Dễ setup và scale

### Database Production

Để dùng PostgreSQL trên production:

1. Tạo database PostgreSQL (Railway, Supabase, Neon, etc.)
2. Cập nhật `DATABASE_URL` trong `.env` hoặc dashboard deploy:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

3. App tự dùng `prisma/schema.postgres.prisma` và `@prisma/adapter-pg` khi `DATABASE_URL` là PostgreSQL. Local dev vẫn dùng SQLite nếu `DATABASE_URL="file:./dev.db"`.
4. Chạy migration:

```bash
npm run db:migrate:deploy
```

> Chỉ biến có prefix `NEXT_PUBLIC_` mới được bundle xuống client. Các secret như `DATABASE_URL`, `NEXTAUTH_SECRET`, `MOMO_SECRET_KEY` không public; `NEXT_PUBLIC_FB_PAGE_ID` là public.

## MoMo Payment Setup

1. Đăng ký tài khoản tại [MoMo Developer Portal](https://developers.momo.vn/)
2. Tạo app và lấy Partner Code, Access Key, Secret Key
3. Cập nhật các biến môi trường trong `.env`
4. Test với sandbox environment trước

## Facebook Messenger Setup

1. Tạo Facebook Page
2. Lấy Page ID từ Facebook Page Settings
3. Cập nhật `NEXT_PUBLIC_FB_PAGE_ID` trong `.env`

## Lưu ý

- Đảm bảo `NEXTAUTH_SECRET` là một chuỗi ngẫu nhiên mạnh trong production
- Sử dụng HTTPS trong production
- Backup database thường xuyên
- Cấu hình CORS nếu cần

## License

MIT
