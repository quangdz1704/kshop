import { Suspense } from 'react';
import ProductList from '@/components/ProductList';

export default function ProductsPage() {
  return (
    <div className="container-shell py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#e6532f]">KShop catalog</p>
        <h1 className="mt-3 text-4xl font-black text-[#181411] sm:text-5xl">Tất cả sản phẩm</h1>
        <p className="mt-4 text-lg leading-8 text-[#665c55]">
          Tìm nhanh, lọc gọn và chọn sản phẩm phù hợp chỉ trong vài cú cuộn.
        </p>
      </div>
      <Suspense fallback={<div className="glass-panel rounded-[2rem] p-8 text-center">Đang tải...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}
