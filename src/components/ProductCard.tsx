import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ShoppingBag, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/88 shadow-[0_20px_55px_rgba(82,47,24,0.10)] backdrop-blur transition duration-500 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(82,47,24,0.18)]">
        <div className="relative h-56 w-full overflow-hidden bg-[#f2e4d8]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#9d8a7d]">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/36 to-transparent opacity-70" />
          <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/88 px-3 py-1 text-xs font-bold text-[#5a3327] shadow-sm backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-[#f4b740] text-[#f4b740]" />
            Best pick
          </div>
          {product.category && (
            <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-[#181411]/78 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {product.category}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-[#201711] transition group-hover:text-[#b9381c]">
            {product.name}
          </h3>
          {product.description && (
            <p className="mb-4 line-clamp-2 text-sm leading-6 text-[#73665e]">
              {product.description}
            </p>
          )}
          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aa8f7c]">
                Giá từ
              </p>
              <p className="text-xl font-black text-[#e6532f]">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(product.price)}
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#181411] text-white shadow-lg shadow-[#181411]/20 transition duration-300 group-hover:rotate-12 group-hover:bg-[#e6532f]">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
