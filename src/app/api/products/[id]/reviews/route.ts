import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const [reviews, aggregate, verifiedPurchase] = await Promise.all([
      prisma.review.findMany({
        where: { productId: id },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.review.aggregate({
        where: { productId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      session?.user?.id
        ? prisma.orderItem.findFirst({
            where: {
              productId: id,
              order: {
                userId: session.user.id,
                status: 'DELIVERED',
              },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      reviews,
      averageRating: aggregate._avg.rating || 0,
      reviewCount: aggregate._count.rating,
      canReview: Boolean(verifiedPurchase),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rating = Number(body.rating);
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          userId: session.user.id,
          status: 'DELIVERED',
        },
      },
      select: { id: true },
    });

    if (!verifiedPurchase) {
      return NextResponse.json(
        { error: 'Only delivered purchases can be reviewed' },
        { status: 403 }
      );
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: id,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId: session.user.id,
        productId: id,
        rating,
        comment,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

