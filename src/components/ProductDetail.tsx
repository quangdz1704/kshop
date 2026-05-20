'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { BadgeCheck, Minus, PackageCheck, Plus, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProductReviews from './ProductReviews';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string | null;
  stock: number;
}

export default function ProductDetail({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (res.ok) {
        alert('Đã thêm vào giỏ hàng!');
        router.refresh();
      } else {
        alert('Có lỗi xảy ra');
      }
    } catch {
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="glass-panel overflow-hidden rounded-[2.2rem]">
        <div className="grid gap-8 p-4 sm:p-6 lg:grid-cols-[1.02fr_0.98fr] lg:p-8">
        <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] bg-[#f2e4d8] shadow-inner">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition duration-700 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#9d8a7d]">
              <PackageCheck className="h-16 w-16" />
            </div>
          )}
          <div className="absolute left-5 top-5 rounded-full bg-white/86 px-4 py-2 text-sm font-bold text-[#5a3327] shadow-sm backdrop-blur">
            {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
          </div>
        </div>

          <div className="flex flex-col rounded-[1.8rem] bg-white/58 p-2 sm:p-4">
          {product.category && (
            <p className="mb-4 w-fit rounded-full border border-[#ead8ca] bg-white/78 px-4 py-2 text-sm font-bold text-[#8a6351]">
              {product.category}
            </p>
          )}

          <h1 className="text-4xl font-black leading-tight text-[#181411] sm:text-5xl">{product.name}</h1>
          
          <p className="mt-5 text-4xl font-black text-[#e6532f]">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.price)}
          </p>

          {product.description && (
            <div className="mt-6 rounded-3xl border border-[#ead8ca] bg-white/75 p-5">
              <h2 className="mb-2 text-lg font-black text-[#181411]">Mô tả</h2>
              <p className="whitespace-pre-line leading-7 text-[#665c55]">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: 'Giao nhanh' },
              { icon: ShieldCheck, label: 'Thanh toán an tâm' },
              { icon: BadgeCheck, label: `${product.stock} sản phẩm còn lại` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#ead8ca] bg-white/72 p-4 text-sm font-bold text-[#4c3f36]">
                <item.icon className="mb-2 h-5 w-5 text-[#e6532f]" />
                {item.label}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="font-bold text-[#352820]">Số lượng</span>
            <div className="flex w-fit items-center gap-2 rounded-full border border-[#ead8ca] bg-white/82 p-1 shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#4b4038] transition hover:bg-[#f8efe6] disabled:opacity-45"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(product.stock, val)));
                }}
                min="1"
                max={product.stock}
                className="w-16 bg-transparent py-2 text-center font-black outline-none"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#4b4038] transition hover:bg-[#f8efe6] disabled:opacity-45"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0}
            className="btn-primary mt-6 w-full text-base"
          >
            <ShoppingCart className="w-5 h-5" />
            {loading ? 'Đang thêm...' : product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </button>
          </div>
        </div>
      </div>
      <ProductReviews productId={product.id} />
    </div>
  );
}
