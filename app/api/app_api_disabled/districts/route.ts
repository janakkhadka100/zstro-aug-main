// app/api/districts/route.ts
import { NextResponse } from 'next/server';
import { getAllDistricts } from '@/lib/db/queries';

type District = {
  id: string | number;
  districtName: string;
  latitude: string;
  longitude: string;
  timezone: string;
  timeDifference?: string;
};

// 👉 Offline/DB-issue fallback list
const FALLBACK: District[] = [
  { id: 'ktm',       districtName: 'Kathmandu',  latitude: '27.7172', longitude: '85.3240', timezone: 'Asia/Kathmandu' },
  { id: 'lalitpur',  districtName: 'Lalitpur',   latitude: '27.6644', longitude: '85.3188', timezone: 'Asia/Kathmandu' },
  { id: 'bhaktapur', districtName: 'Bhaktapur',  latitude: '27.6710', longitude: '85.4298', timezone: 'Asia/Kathmandu' },
  { id: 'kaski',     districtName: 'Kaski (Pokhara)', latitude: '28.2096', longitude: '83.9856', timezone: 'Asia/Kathmandu' },
  { id: 'morang',    districtName: 'Morang',     latitude: '26.7210', longitude: '87.3090', timezone: 'Asia/Kathmandu' },
  { id: 'jhapa',     districtName: 'Jhapa',      latitude: '26.6390', longitude: '88.0000', timezone: 'Asia/Kathmandu' },
  { id: 'rupandehi', districtName: 'Rupandehi',  latitude: '27.5910', longitude: '83.4636', timezone: 'Asia/Kathmandu' },
];

export async function GET() {
  try {
    const rows = await getAllDistricts(); // may throw if DB down
    if (Array.isArray(rows) && rows.length > 0) {
      // Normalize: always return { districts: [...] }
      return NextResponse.json({ districts: rows }, { status: 200 });
    }
    // DB returned empty → still serve fallback
    return NextResponse.json({ districts: FALLBACK, note: 'fallback-empty' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching districts:', error);
    // Never 500 out for this endpoint; provide fallback so UI remains usable
    return NextResponse.json({ districts: FALLBACK, note: 'fallback-error' }, { status: 200 });
  }
}
