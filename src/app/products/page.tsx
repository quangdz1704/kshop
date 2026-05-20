import { Suspense } from 'react';
import ProductList from '@/components/ProductList';

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tất cả sản phẩm</h1>
      <Suspense fallback={<div>Đang tải...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}

