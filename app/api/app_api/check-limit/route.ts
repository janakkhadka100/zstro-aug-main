// /app/api/check-limit/route.ts
import { auth } from '@/app/(auth)/auth';
import { isUserOverDailyLimit } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const isOver = await isUserOverDailyLimit(userId);
  return Response.json({ isOverLimit: isOver });
}
