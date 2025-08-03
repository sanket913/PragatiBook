import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const bill = await db.collection('bills').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(user.id)
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const formattedBill = {
      id: bill._id.toString(),
      userId: bill.userId.toString(),
      customerName: bill.customerName,
      description: bill.description,
      date: bill.date,
      items: bill.items,
      total: bill.total,
      createdAt: bill.createdAt.toISOString(),
      updatedAt: bill.updatedAt.toISOString()
    };

    return NextResponse.json(formattedBill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerName, description, date, items, total } = await request.json();

    // Validation
    if (!customerName || !date || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name, date, and items are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date();

    const result = await db.collection('bills').updateOne(
      {
        _id: new ObjectId(params.id),
        userId: new ObjectId(user.id)
      },
      {
        $set: {
          customerName,
          description,
          date,
          items,
          total,
          updatedAt: now
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Fetch and return updated bill
    const updatedBill = await db.collection('bills').findOne({
      _id: new ObjectId(params.id)
    });

    const formattedBill = {
      id: updatedBill!._id.toString(),
      userId: updatedBill!.userId.toString(),
      customerName: updatedBill!.customerName,
      description: updatedBill!.description,
      date: updatedBill!.date,
      items: updatedBill!.items,
      total: updatedBill!.total,
      createdAt: updatedBill!.createdAt.toISOString(),
      updatedAt: updatedBill!.updatedAt.toISOString()
    };

    return NextResponse.json(formattedBill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const result = await db.collection('bills').deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(user.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}