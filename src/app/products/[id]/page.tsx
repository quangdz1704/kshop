import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetail from '@/components/ProductDetail';

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container-shell py-10">
      <ProductDetail product={product} />
    </div>
  );
}
