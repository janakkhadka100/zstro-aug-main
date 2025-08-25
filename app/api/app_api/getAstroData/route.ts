import { NextResponse } from 'next/server';
import { getAstroDataByUserIdAndType } from '@/lib/db/queries';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId ) {
      return NextResponse.json({ message: 'Missing userId ' }, { status: 400 });
    }

    const data = await getAstroDataByUserIdAndType({ userId, type: 'kundli' });

    if (!data) {
      return NextResponse.json({ message: 'No astrological data found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching astrological data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
