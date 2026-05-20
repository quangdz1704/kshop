'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Package, ShoppingBag, ShoppingCart, Sparkles, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { data: session } = useSession();
  const { itemCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-[#fffaf5]/82 shadow-[0_12px_40px_rgba(70,43,26,0.08)] backdrop-blur-xl">
      <div className="container-shell">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="group flex items-center gap-2 text-2xl font-black tracking-tight text-[#211711]">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#181411] text-white shadow-lg shadow-[#181411]/15 transition group-hover:rotate-3">
              <ShoppingBag className="h-5 w-5" />
            </span>
            K<span className="text-[#e6532f]">Shop</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/products"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[#53473f] transition hover:bg-white hover:text-[#b9381c] sm:inline-flex"
            >
              Sản phẩm
            </Link>

            {session?.user && (
              <Link
                href="/orders"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[#53473f] transition hover:bg-white hover:text-[#b9381c] md:inline-flex"
              >
                Đơn hàng
              </Link>
            )}

            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="hidden items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-[#53473f] transition hover:bg-white hover:text-[#b9381c] md:inline-flex"
              >
                <Package className="h-4 w-4" />
                Admin
              </Link>
            )}

            {session?.user && <NotificationBell />}

            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#ead8ca] bg-white/80 text-[#352820] shadow-sm transition hover:-translate-y-0.5 hover:border-[#e6532f]/45 hover:text-[#b9381c]"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e6532f] px-1 text-xs font-bold text-white shadow-lg shadow-[#e6532f]/25">
                  {itemCount}
                </span>
              )}
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-[#ead8ca] bg-white/70 px-3 py-2 text-sm font-medium text-[#4b4038] lg:flex">
                  <User className="h-4 w-4 text-[#e6532f]" />
                  <span className="max-w-36 truncate">{session.user.name || session.user.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead8ca] bg-white/80 text-[#53473f] shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-600"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-primary px-4 py-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
