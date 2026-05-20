'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BellRing, Package, RefreshCw } from 'lucide-react';
import { normalizeOrderStatus, ORDER_STATUS_META, ORDER_STATUSES } from '@/lib/orderStatus';

interface Order {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const previousStatuses = useRef<Map<string, string>>(new Map());

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      const nextOrders = data.orders || [];

      if (previousStatuses.current.size > 0) {
        const changedOrder = nextOrders.find((order: Order) => {
          const previous = previousStatuses.current.get(order.id);
          return previous && previous !== order.status;
        });

        if (changedOrder) {
          const meta = ORDER_STATUS_META[normalizeOrderStatus(changedOrder.status)];
          setToast(`Đơn #${changedOrder.id.slice(0, 8)} ${meta.label.toLowerCase()}`);
          window.setTimeout(() => setToast(null), 4800);
        }
      }

      previousStatuses.current = new Map(
        nextOrders.map((order: Order) => [order.id, order.status])
      );
      setOrders(nextOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    fetchOrders();
    const interval = window.setInterval(() => fetchOrders(true), 10000);
    return () => window.clearInterval(interval);
  }, [fetchOrders, session, router]);

  const getProgressIndex = (status: string) => {
    const normalized = normalizeOrderStatus(status);
    if (normalized === 'CANCELLED') return 0;
    return ORDER_STATUSES.filter((item) => item !== 'CANCELLED').indexOf(normalized);
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
      {toast && (
        <div className="fixed right-4 top-20 z-[60] animate-slide-up rounded-[1.35rem] border border-[#f5c8b8] bg-white p-4 shadow-[0_24px_70px_rgba(70,43,26,0.18)]">
          <p className="flex items-center gap-2 text-sm font-black text-[#181411]">
            <BellRing className="h-4 w-4 text-[#e6532f]" />
            {toast}
          </p>
        </div>
      )}

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#e6532f]">Live orders</p>
          <h1 className="mt-3 text-4xl font-black text-[#181411] sm:text-5xl">Đơn hàng của tôi</h1>
          <p className="mt-3 text-[#665c55]">Tự cập nhật mỗi 10 giây khi shop đổi trạng thái.</p>
        </div>
        <button onClick={() => fetchOrders(true)} className="btn-secondary w-fit py-2.5">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel rounded-[2.2rem] py-16 text-center">
          <Package className="mx-auto mb-5 h-20 w-20 text-[#e6532f]" />
          <h2 className="text-3xl font-black text-[#181411]">Chưa có đơn hàng nào</h2>
          <p className="mt-3 text-[#665c55]">Hãy mua sắm để tạo đơn hàng đầu tiên</p>
          <Link
            href="/products"
            className="btn-primary mt-7"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const normalizedStatus = normalizeOrderStatus(order.status);
            const statusMeta = ORDER_STATUS_META[normalizedStatus];
            const progressIndex = getProgressIndex(order.status);
            const visibleStatuses = ORDER_STATUSES.filter((item) => item !== 'CANCELLED');
            return (
            <div key={order.id} className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-semibold text-[#76685f]">
                    Mã đơn <span className="font-black text-[#181411]">#{order.id.slice(0, 8)}</span>
                  </p>
                  <p className="mt-1 text-sm text-[#76685f]">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-black ${statusMeta.tone}`}
                  >
                    <statusMeta.icon className="h-4 w-4" />
                    {statusMeta.label}
                  </span>
                  <p className="mt-2 text-sm text-[#76685f]">
                    Thanh toán:{' '}
                    <span
                      className={
                        order.paymentStatus === 'PAID'
                          ? 'font-black text-emerald-700'
                          : 'font-black text-amber-700'
                      }
                    >
                      {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mb-5 grid gap-2 sm:grid-cols-5">
                {visibleStatuses.map((status, index) => {
                  const meta = ORDER_STATUS_META[status];
                  const active = normalizedStatus !== 'CANCELLED' && index <= progressIndex;
                  return (
                    <div
                      key={status}
                      className={`rounded-2xl border p-3 ${
                        active
                          ? 'border-[#f5c8b8] bg-[#fff3eb] text-[#b9381c]'
                          : 'border-[#ead8ca] bg-white/55 text-[#9a8576]'
                      }`}
                    >
                      <meta.icon className="mb-2 h-4 w-4" />
                      <p className="text-xs font-black">{meta.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mb-4 border-t border-[#ead8ca] pt-4">
                {order.items.map((item) => (
                  <div key={item.id} className="mb-2 flex justify-between gap-4 text-sm">
                    <span className="font-semibold text-[#4c3f36]">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-bold text-[#181411]">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[#ead8ca] pt-4">
                <span className="text-lg font-black text-[#181411]">Tổng cộng</span>
                <span className="text-xl font-black text-[#e6532f]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.total)}
                </span>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
