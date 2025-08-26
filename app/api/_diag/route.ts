import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasDb:
      !!process.env.DATABASE_URL ||
      !!process.env.POSTGRES_URL ||
      !!process.env.POSTGRES_HOST,
  });
}
