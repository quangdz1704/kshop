'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingBag, Users } from 'lucide-react';

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
  });

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [session, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">Sản phẩm</p>
              <p className="text-3xl font-bold">{stats.products}</p>
            </div>
            <Package className="w-12 h-12 text-blue-600" />
          </div>
          <Link
            href="/admin/products"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Quản lý sản phẩm →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">Đơn hàng</p>
              <p className="text-3xl font-bold">{stats.orders}</p>
            </div>
            <ShoppingBag className="w-12 h-12 text-green-600" />
          </div>
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Quản lý đơn hàng →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">Người dùng</p>
              <p className="text-3xl font-bold">{stats.users}</p>
            </div>
            <Users className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

