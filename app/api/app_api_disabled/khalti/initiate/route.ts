import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const khaltiRes = await fetch('https://dev.khalti.com/api/v2/epayment/initiate/', {
    method: 'POST',
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      return_url: body.return_url,
      website_url: body.website_url,
      amount: body.amount,
      purchase_order_id: body.purchase_order_id,
      purchase_order_name: body.purchase_order_name,
      customer_info: body.customer_info,
    }),
  });

  // Check if response is OK before parsing as JSON
  if (!khaltiRes.ok) {
    const text = await khaltiRes.text(); // Read the response as text (HTML error page)
    console.error('Khalti API Error:', khaltiRes.status, text);
    return NextResponse.json({ error: 'Failed to initiate payment with Khalti' }, { status: khaltiRes.status });
  }

  const data = await khaltiRes.json();
  return NextResponse.json(data);
}
