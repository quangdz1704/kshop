import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Truck } from 'lucide-react';

async function getProducts() {
  const products = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
  });
  return products;
}

export default async function Home() {
  const products = await getProducts();
  const heroProducts = products.slice(0, 3);

  return (
    <div className="container-shell py-8 sm:py-12">
      <section className="grid min-h-[calc(100vh-6rem)] items-center gap-10 pb-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="animate-slide-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ead8ca] bg-white/70 px-4 py-2 text-sm font-semibold text-[#6f4f3d] shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#e6532f]" />
            Săn deal đẹp, giao nhanh, thanh toán gọn
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] text-[#181411] sm:text-6xl lg:text-7xl">
            KShop biến mua sắm online thành trải nghiệm đáng nhớ.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#665c55]">
            Bộ sưu tập sản phẩm tinh chọn, giao diện dễ quét, CTA rõ ràng và ưu đãi được đặt đúng lúc để người mua ra quyết định nhanh hơn.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="btn-primary">
              Xem tất cả sản phẩm
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#featured-products" className="btn-secondary">
              Xem hàng mới về
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: 'Giao nhanh', text: 'Theo dõi đơn rõ ràng' },
              { icon: ShieldCheck, label: 'Thanh toán an tâm', text: 'MoMo và xác nhận đơn' },
              { icon: BadgeCheck, label: 'Hàng tinh chọn', text: 'Thông tin dễ kiểm tra' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur">
                <item.icon className="mb-3 h-5 w-5 text-[#e6532f]" />
                <p className="font-bold text-[#211711]">{item.label}</p>
                <p className="mt-1 text-sm text-[#76685f]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <div className="absolute left-4 top-6 h-56 w-56 rounded-full bg-[#f6c04f]/20 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[#e6532f]/16 blur-3xl" />
          <div className="relative grid h-full grid-cols-2 gap-4">
            <div className="animate-float mt-16 overflow-hidden rounded-[2rem] border border-white/80 bg-[#181411] p-5 text-white shadow-[0_28px_80px_rgba(24,20,17,0.22)]">
              <p className="text-sm font-semibold text-white/65">KShop Picks</p>
              <p className="mt-3 text-4xl font-black">Fresh drop</p>
              <p className="mt-4 text-sm leading-6 text-white/72">
                Sản phẩm mới được đưa lên đầu, giúp khách thấy hàng đáng chú ý ngay khi vào shop.
              </p>
            </div>
            {heroProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`glass-panel group overflow-hidden rounded-[2rem] p-3 transition duration-500 hover:-translate-y-2 ${
                  index === 0 ? 'animate-float-delayed' : ''
                } ${index === 1 ? 'translate-y-10' : ''}`}
              >
                <div className="relative h-48 overflow-hidden rounded-[1.45rem] bg-[#f2e4d8]">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-[#9d8a7d]">
                      KShop
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="line-clamp-1 font-bold text-[#211711]">{product.name}</p>
                  <p className="mt-1 font-black text-[#e6532f]">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="featured-products" className="py-10">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#e6532f]">Hàng mới</p>
            <h2 className="mt-2 text-3xl font-black text-[#181411] sm:text-4xl">Sản phẩm nổi bật</h2>
          </div>
          <Link href="/products" className="btn-secondary w-fit py-2.5">
            Xem thêm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
