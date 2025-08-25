import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  // — tell TS that params is a Promise:
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // — await the promise to get the actual params object
    const { id: userId } = await params;

    console.log('Fetching user with ID:', userId);

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
