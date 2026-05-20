import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

async function createMoMoPayment(orderId: string, amount: number) {
  const partnerCode = process.env.MOMO_PARTNER_CODE || '';
  const accessKey = process.env.MOMO_ACCESS_KEY || '';
  const secretKey = process.env.MOMO_SECRET_KEY || '';
  const environment = process.env.MOMO_ENVIRONMENT || 'sandbox';

  const endpoint =
    environment === 'production'
      ? 'https://payment.momo.vn/v2/gateway/api/create'
      : 'https://test-payment.momo.vn/v2/gateway/api/create';

  const orderInfo = `Thanh toan don hang ${orderId}`;
  const requestId = orderId;
  const extraData = '';
  const returnUrl = `${process.env.NEXTAUTH_URL}/orders?success=true`;
  const notifyUrl = `${process.env.NEXTAUTH_URL}/api/orders/momo-callback`;

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=captureWallet`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode,
    partnerName: 'KShop',
    storeId: 'KShop',
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: returnUrl,
    ipnUrl: notifyUrl,
    lang: 'vi',
    extraData,
    requestType: 'captureWallet',
    autoCapture: true,
    orderExpireTime: 15,
    signature,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('MoMo payment error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, shippingAddress } = body;

    if (!phone || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing phone or shipping address' },
        { status: 400 }
      );
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'MOMO',
        shippingAddress,
        phone,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // Create MoMo payment
    try {
      const momoResponse = await createMoMoPayment(order.id, total);

      if (momoResponse.payUrl) {
        // Update order with MoMo transaction ID
        await prisma.order.update({
          where: { id: order.id },
          data: { momoTransactionId: momoResponse.requestId },
        });

        // Clear cart
        await prisma.cartItem.deleteMany({
          where: { userId: session.user.id },
        });

        return NextResponse.json({
          success: true,
          orderId: order.id,
          paymentUrl: momoResponse.payUrl,
        });
      } else {
        throw new Error('No payment URL from MoMo');
      }
    } catch (error) {
      console.error('MoMo payment creation failed:', error);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

