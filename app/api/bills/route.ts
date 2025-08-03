import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { Bill } from '@/models/Bill';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const bills = await db.collection('bills')
      .find({ userId: new ObjectId(user.id) })
      .sort({ updatedAt: -1 })
      .toArray();

    const formattedBills = bills.map(bill => ({
      id: bill._id.toString(),
      userId: bill.userId.toString(),
      customerName: bill.customerName,
      description: bill.description,
      date: bill.date,
      items: bill.items,
      total: bill.total,
      createdAt: bill.createdAt.toISOString(),
      updatedAt: bill.updatedAt.toISOString()
    }));

    return NextResponse.json(formattedBills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const newBill: Omit<Bill, '_id'> = {
      userId: new ObjectId(user.id),
      customerName,
      description,
      date,
      items,
      total,
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('bills').insertOne(newBill);

    const createdBill = {
      id: result.insertedId.toString(),
      userId: user.id,
      customerName,
      description,
      date,
      items,
      total,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    return NextResponse.json(createdBill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}