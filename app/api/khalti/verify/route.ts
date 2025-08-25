import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { pidx } = body;

  if (!pidx) {
    return NextResponse.json({ error: 'Missing pidx' }, { status: 400 });
  }

  try {
    const response = await fetch('https://khalti.com/api/v2/epayment/lookup/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`, // store in .env
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Khalti verification failed', data }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Khalti verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
