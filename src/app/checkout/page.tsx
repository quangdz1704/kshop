'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CreditCard, MapPin, Phone, ShieldCheck } from 'lucide-react';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

interface CheckoutForm {
  phone: string;
  shippingAddress: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>();

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    fetchCart();
  }, [session, router]);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setCartItems(data.items || []);
      const sum = (data.items || []).reduce(
        (acc: number, item: CartItem) => acc + item.product.price * item.quantity,
        0
      );
      setTotal(sum);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.phone,
          shippingAddress: data.shippingAddress,
        }),
      });

      const orderData = await res.json();

      if (res.ok && orderData.paymentUrl) {
        window.location.href = orderData.paymentUrl;
      } else {
        alert('Có lỗi xảy ra khi tạo đơn hàng');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container-shell py-10">
        <div className="glass-panel rounded-[2rem] p-8 text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container-shell py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#e6532f]">Secure checkout</p>
        <h1 className="mt-3 text-4xl font-black text-[#181411] sm:text-5xl">Thanh toán</h1>
        <p className="mt-4 text-lg leading-8 text-[#665c55]">
          Hoàn tất thông tin giao hàng, kiểm tra đơn và chuyển sang MoMo chỉ trong một bước.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[2rem] p-5 sm:p-7">
          <h2 className="mb-5 text-2xl font-black text-[#181411]">Thông tin giao hàng</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[#4c3f36]">
                <Phone className="h-4 w-4 text-[#e6532f]" />
                Số điện thoại *
              </label>
              <input
                {...register('phone', {
                  required: 'Vui lòng nhập số điện thoại',
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ',
                  },
                })}
                type="tel"
                className="field-control"
                placeholder="0123456789"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[#4c3f36]">
                <MapPin className="h-4 w-4 text-[#e6532f]" />
                Địa chỉ giao hàng *
              </label>
              <textarea
                {...register('shippingAddress', {
                  required: 'Vui lòng nhập địa chỉ giao hàng',
                })}
                rows={4}
                className="field-control min-h-32 resize-none"
                placeholder="Nhập địa chỉ giao hàng"
              />
              {errors.shippingAddress && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.shippingAddress.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={processing || cartItems.length === 0}
              className="btn-primary w-full text-base"
            >
              <CreditCard className="h-5 w-5" />
              {processing ? 'Đang xử lý...' : 'Thanh toán qua MoMo'}
            </button>
          </form>
        </div>

        <div className="glass-panel h-fit rounded-[2rem] p-5 sm:p-7 lg:sticky lg:top-24">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-[#181411]">Đơn hàng</h2>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-xs font-bold text-[#5f5148]">
              <ShieldCheck className="h-4 w-4 text-[#e6532f]" />
              Bảo mật
            </span>
          </div>
          <div>
            <div className="mb-5 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 rounded-2xl bg-white/64 p-3 text-sm">
                  <span className="font-semibold text-[#4c3f36]">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="shrink-0 font-bold text-[#181411]">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#ead8ca] pt-5">
              <div className="flex justify-between text-lg font-black">
                <span>Tổng cộng</span>
                <span className="text-[#e6532f]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
