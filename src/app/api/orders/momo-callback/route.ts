import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    const secretKey = process.env.MOMO_SECRET_KEY || '';

    // Verify signature
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update order status
    if (resultCode === 0) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          momoTransactionId: transId,
        },
      });
      await prisma.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'PAYMENT_SUCCESS',
          title: 'Thanh toán thành công',
          message: `Đơn #${order.id.slice(0, 8)} đã được xác nhận và chuyển sang xử lý.`,
        },
      });
    } else {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      });
      await prisma.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'PAYMENT_FAILED',
          title: 'Thanh toán chưa hoàn tất',
          message: `Đơn #${order.id.slice(0, 8)} chưa thanh toán thành công. Vui lòng thử lại hoặc liên hệ shop.`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing MoMo callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}
