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
    <div className="bg-white rounded-lg shadow-md p-4 flex gap-4">
      <Link href={`/products/${item.product.id}`}>
        <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
          {item.product.image ? (
            <Image
              src={item.product.image}
              alt={item.product.name}
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1">
        <Link href={`/products/${item.product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600">
            {item.product.name}
          </h3>
        </Link>
        <p className="text-blue-600 font-bold mb-2">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(item.product.price)}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="p-1 border rounded disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.product.stock}
              className="p-1 border rounded disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(subtotal)}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

