import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeOrderStatus, ORDER_STATUS_META } from '@/lib/orderStatus';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, userId: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    if (existingOrder.status !== status) {
      const statusMeta = ORDER_STATUS_META[normalizeOrderStatus(status)];
      await prisma.notification.create({
        data: {
          userId: existingOrder.userId,
          orderId: existingOrder.id,
          type: 'ORDER_STATUS',
          title: `Đơn hàng ${statusMeta.label.toLowerCase()}`,
          message: `${statusMeta.description} Mã đơn #${existingOrder.id.slice(0, 8)}.`,
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
