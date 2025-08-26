import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fallback = [
  { id: 1, name: "Kathmandu" },
  { id: 2, name: "Lalitpur" },
  { id: 3, name: "Bhaktapur" },
];

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: fallback });
  } catch {
    return NextResponse.json({ ok: false, data: fallback }, { status: 200 });
  }
}
