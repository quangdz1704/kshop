'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string | null;
}

export default function ProductList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/products/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      params.append('page', page.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateURL(search, category, 1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
    updateURL(search, newCategory, 1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    updateURL(search, category, nextPage);
  };

  const updateURL = (nextSearch = search, nextCategory = category, nextPage = page) => {
    const params = new URLSearchParams();
    if (nextSearch) params.append('search', nextSearch);
    if (nextCategory) params.append('category', nextCategory);
    if (nextPage > 1) params.append('page', nextPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div>
      <div className="glass-panel mb-8 space-y-5 rounded-[2rem] p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#aa8f7c]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="field-control pl-12"
            />
          </div>
          <button
            type="submit"
            className="btn-primary shrink-0"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Tìm kiếm
          </button>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#8d7667]">
            <Filter className="h-4 w-4" />
            Lọc nhanh
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !category
                  ? 'bg-[#181411] text-white shadow-lg shadow-[#181411]/15'
                  : 'border border-[#ead8ca] bg-white/75 text-[#5d5048] hover:border-[#e6532f]/45 hover:text-[#b9381c]'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === cat
                    ? 'bg-[#181411] text-white shadow-lg shadow-[#181411]/15'
                    : 'border border-[#ead8ca] bg-white/75 text-[#5d5048] hover:border-[#e6532f]/45 hover:text-[#b9381c]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-96 animate-pulse rounded-[1.75rem] bg-white/60 shadow-sm" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel rounded-[2rem] py-16 text-center text-[#665c55]">
          <p className="text-xl font-bold text-[#181411]">Không tìm thấy sản phẩm nào</p>
          <p className="mt-2">Thử đổi từ khóa hoặc chọn lại danh mục.</p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <span className="rounded-full border border-[#ead8ca] bg-white/75 px-4 py-2 text-sm font-bold text-[#5d5048]">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
