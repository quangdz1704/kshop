import {
  CheckCircle2,
  Clock3,
  LucideIcon,
  PackageCheck,
  PackageSearch,
  Truck,
  XCircle,
} from 'lucide-react';

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    tone: string;
    icon: LucideIcon;
  }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    description: 'Đơn đã được tạo và đang chờ xác nhận.',
    tone: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock3,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    description: 'Shop đã xác nhận đơn hàng của bạn.',
    tone: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: CheckCircle2,
  },
  PROCESSING: {
    label: 'Đang xử lý',
    description: 'Sản phẩm đang được chuẩn bị và đóng gói.',
    tone: 'bg-violet-100 text-violet-800 border-violet-200',
    icon: PackageSearch,
  },
  SHIPPED: {
    label: 'Đã gửi hàng',
    description: 'Đơn hàng đang trên đường giao đến bạn.',
    tone: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Đã giao hàng',
    description: 'Đơn hàng đã giao thành công.',
    tone: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: PackageCheck,
  },
  CANCELLED: {
    label: 'Đã hủy',
    description: 'Đơn hàng đã bị hủy.',
    tone: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
};

export function normalizeOrderStatus(status: string): OrderStatus {
  return ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : 'PENDING';
}

