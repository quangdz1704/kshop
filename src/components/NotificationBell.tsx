'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Clock3 } from 'lucide-react';
import { NOTIFICATION_INTERVAL } from '@/constants';

interface Notification {
  id: string;
  orderId: string | null;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<Notification | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const bootstrappedRef = useRef(false);

  const latestUnread = useMemo(
    () => notifications.find((item) => !item.read),
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const nextNotifications = data.notifications || [];

      if (bootstrappedRef.current) {
        const fresh = nextNotifications.find(
          (item: Notification) => !seenIdsRef.current.has(item.id)
        );
        if (fresh) {
          setToast(fresh);
          window.setTimeout(() => setToast(null), 5200);
        }
      }

      seenIdsRef.current = new Set(
        nextNotifications.map((item: Notification) => item.id)
      );
      bootstrappedRef.current = true;
      setNotifications(nextNotifications);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, NOTIFICATION_INTERVAL);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    fetchNotifications();
  };

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(value));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#ead8ca] bg-white/80 text-[#352820] shadow-sm transition hover:-translate-y-0.5 hover:border-[#e6532f]/45 hover:text-[#b9381c]"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e6532f] px-1 text-xs font-bold text-white shadow-lg shadow-[#e6532f]/25">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-[min(92vw,380px)] overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/95 shadow-[0_24px_70px_rgba(70,43,26,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[#ead8ca] px-5 py-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e6532f]">
                Realtime
              </p>
              <h3 className="text-lg font-black text-[#181411]">Thông báo</h3>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-[#665c55] transition hover:bg-[#fff3eb] hover:text-[#b9381c]"
            >
              <CheckCheck className="h-4 w-4" />
              Đã đọc
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-[#76685f]">
                Chưa có thông báo mới.
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href="/orders"
                  onClick={() => setOpen(false)}
                  className={`mb-2 block rounded-2xl border p-4 transition hover:-translate-y-0.5 ${item.read
                    ? 'border-[#f0e4da] bg-white/70'
                    : 'border-[#f5c8b8] bg-[#fff3eb]'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-[#211711]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#665c55]">
                        {item.message}
                      </p>
                    </div>
                    {!item.read && (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#e6532f]" />
                    )}
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#9a8576]">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatTime(item.createdAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {toast && latestUnread && (
        <div className="fixed right-4 top-20 z-[60] w-[min(92vw,360px)] animate-slide-up rounded-[1.35rem] border border-[#f5c8b8] bg-white p-4 shadow-[0_24px_70px_rgba(70,43,26,0.18)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e6532f]">
            Cập nhật đơn hàng
          </p>
          <p className="mt-1 font-black text-[#181411]">{toast.title}</p>
          <p className="mt-1 text-sm leading-6 text-[#665c55]">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

