'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CartItem from '@/components/CartItem';
import { ArrowRight, BadgeCheck, ShoppingBag, Truck } from 'lucide-react';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    stock: number;
  };
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setCartItems(data.items || []);
      calculateTotal(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    fetchCart();
  }, [fetchCart, session, router]);

  const calculateTotal = (items: CartItem[]) => {
    const sum = items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
    setTotal(sum);
  };

  const handleRemove = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="container-shell py-10">
        <div className="glass-panel rounded-[2rem] p-8 text-center">Đang tải...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-shell py-10">
        <div className="glass-panel mx-auto max-w-2xl rounded-[2.2rem] px-6 py-16 text-center">
          <ShoppingBag className="mx-auto mb-5 h-20 w-20 text-[#e6532f]" />
          <h2 className="text-3xl font-black text-[#181411]">Giỏ hàng trống</h2>
          <p className="mx-auto mt-3 max-w-md text-[#665c55]">Hãy thêm sản phẩm vào giỏ hàng để bắt đầu checkout nhanh hơn.</p>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary mt-7"
          >
            Mua sắm ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#e6532f]">Checkout ready</p>
          <h1 className="mt-3 text-4xl font-black text-[#181411] sm:text-5xl">Giỏ hàng</h1>
        </div>
        <div className="flex gap-2 text-sm font-semibold text-[#665c55]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2">
            <Truck className="h-4 w-4 text-[#e6532f]" />
            Giao nhanh
          </span>
          <span className="hidden items-center gap-2 rounded-full bg-white/75 px-4 py-2 sm:inline-flex">
            <BadgeCheck className="h-4 w-4 text-[#e6532f]" />
            Xác nhận đơn rõ ràng
          </span>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>

        <div className="glass-panel h-fit rounded-[2rem] p-6 md:sticky md:top-24">
          <h2 className="mb-5 text-2xl font-black text-[#181411]">Tổng kết</h2>
          <div className="mb-5 space-y-3">
            <div className="flex justify-between text-[#665c55]">
              <span>Tạm tính</span>
              <span>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(total)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#ead8ca] pt-4 text-lg font-black">
              <span>Tổng cộng</span>
              <span className="text-[#e6532f]">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(total)}
              </span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="btn-primary w-full"
          >
            Thanh toán
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
