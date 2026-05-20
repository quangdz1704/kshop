'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Truck } from 'lucide-react';
import { normalizeOrderStatus, ORDER_STATUS_META, ORDER_STATUSES } from '@/lib/orderStatus';

interface Order {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchOrders();
    const interval = window.setInterval(() => fetchOrders(true), 10000);
    return () => window.clearInterval(interval);
  }, [fetchOrders, session, router]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingId(null);
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
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#e6532f]">Admin live ops</p>
          <h1 className="mt-3 text-4xl font-black text-[#181411] sm:text-5xl">Quản lý đơn hàng</h1>
          <p className="mt-3 text-[#665c55]">Tự làm mới mỗi 10 giây, đổi trạng thái sẽ gửi notification cho khách.</p>
        </div>
        <button onClick={() => fetchOrders(true)} className="btn-secondary w-fit py-2.5">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      <div className="glass-panel overflow-hidden rounded-[2rem]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[880px]">
          <thead className="bg-white/68">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-[#8d7667]">
                Mã đơn
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-[#8d7667]">
                Khách hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-[#8d7667]">
                Tổng tiền
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-[#8d7667]">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-[#8d7667]">
                Thanh toán
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-[#8d7667]">
                Cập nhật
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ead8ca]">
            {orders.map((order) => {
              const statusMeta = ORDER_STATUS_META[normalizeOrderStatus(order.status)];
              return (
              <tr key={order.id} className="transition hover:bg-white/52">
                <td className="whitespace-nowrap px-6 py-5 text-sm font-black text-[#181411]">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-semibold text-[#4c3f36]">
                  {order.user.name || order.user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-black text-[#e6532f]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.total)}
                </td>
                <td className="whitespace-nowrap px-6 py-5">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-black ${statusMeta.tone}`}>
                    <statusMeta.icon className="h-4 w-4" />
                    {statusMeta.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-5">
                  <span
                    className={
                      order.paymentStatus === 'PAID'
                        ? 'font-black text-emerald-700'
                        : 'font-black text-amber-700'
                    }
                  >
                    {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-5">
                  <div className="relative inline-flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#e6532f]" />
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="rounded-full border border-[#ead8ca] bg-white/85 px-3 py-2 text-sm font-bold text-[#352820] outline-none transition focus:border-[#e6532f] focus:ring-4 focus:ring-[#e6532f]/15 disabled:opacity-55"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_META[status].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
