'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2 } from 'lucide-react';

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

interface CartItemProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export default function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const subtotal = item.product.price * item.quantity;

  return (
    <div className="group flex gap-4 rounded-[1.5rem] border border-white/75 bg-white/82 p-4 shadow-[0_16px_42px_rgba(82,47,24,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(82,47,24,0.14)]">
      <Link href={`/products/${item.product.id}`} className="shrink-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-[1.15rem] bg-[#f2e4d8]">
          {item.product.image ? (
            <Image
              src={item.product.image}
              alt={item.product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-semibold text-[#9d8a7d]">
              KShop
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/products/${item.product.id}`}>
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-[#211711] hover:text-[#b9381c]">
            {item.product.name}
          </h3>
        </Link>
        <p className="mb-3 font-black text-[#e6532f]">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(item.product.price)}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-fit items-center gap-1 rounded-full border border-[#ead8ca] bg-white/75 p-1">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f8efe6] disabled:opacity-45"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.product.stock}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f8efe6] disabled:opacity-45"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-black text-[#211711]">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(subtotal)}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-700"
              aria-label="Xóa sản phẩm"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
