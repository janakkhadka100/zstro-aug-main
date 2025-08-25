// ✅ app/api/astro-summary/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getAstroDataByUserIdAndType } from '@/lib/db/queries';
import { calculateHouse, calculateNavamsha } from "@/lib/ai/astroCalculations";

// 👉 ग्रहको Strength निकाल्ने Helper
function calculateShadbalaForPlanet(p: any, ascRasiId: number): any {
  const longitude = Number(p.longitude ?? 0);
  const house = calculateHouse(ascRasiId, p.rasi.id);

  // ✅ यहाँ तपाईँले आफैंको authentic formula राख्न सक्नुहुन्छ
  const sthanabala = Number(((longitude % 30) * 4).toFixed(1));     // राशिभित्रको डिग्री ×4
  const digbala = Number((house * 5).toFixed(1));                  // घरको नम्बर ×5
  const kalabala = Number(((longitude / 12) % 30).toFixed(1));     // डेमो formula
  const cheshtabala = Number(((longitude % 15) * 0.8).toFixed(1)); // डेमो formula
  const naisargika = 40;                                           // स्थिर उदाहरण
  const drikbala = Number(((house * 2) + (longitude % 10)).toFixed(1)); // ⭐ दृष्टिबलको डेमो formula

  const total = sthanabala + digbala + kalabala + cheshtabala + naisargika + drikbala;

  return {
    planet: p.name,
    sthanabala,
    digbala,
    kalabala,
    cheshtabala,
    naisargika,
    drikbala, // ⭐ नयाँ थपिएको बल
    total: Number(total.toFixed(1)),
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ✅ Fetch all astro data
    const kundliRaw: any = await getAstroDataByUserIdAndType({ userId, type: 'kundli' });
    const planetRaw: any = await getAstroDataByUserIdAndType({ userId, type: 'planetPosition' });
    const dashaRaw: any = await getAstroDataByUserIdAndType({ userId, type: 'dashaPeriods' });

    const kundli = kundliRaw?.content?.kundliData ? JSON.parse(kundliRaw.content.kundliData) : {};
    const planet = planetRaw?.content?.kundliData ? JSON.parse(planetRaw.content.kundliData) : {};
    const dasha = dashaRaw?.content?.kundliData ? JSON.parse(dashaRaw.content.kundliData) : {};

    let lagnaSign = 'N/A';
    let chandraSign = 'N/A';
    let ascRasiId = 1;

    // ✅ लग्न र चन्द्र राशी निकाल्ने
    if (Array.isArray(planet?.planet_position)) {
      const asc = planet.planet_position.find((p: any) => p.name === 'Ascendant');
      const moon = planet.planet_position.find((p: any) => p.name === 'Moon');
      if (asc?.rasi?.name) {
        lagnaSign = asc.rasi.name;
        ascRasiId = asc.rasi.id;
      }
      if (moon?.rasi?.name) chandraSign = moon.rasi.name;
    }

    // ✅ ग्रहहरूको विवरण
    let planetsWithDetails: any[] = [];
    if (Array.isArray(planet?.planet_position)) {
      planetsWithDetails = planet.planet_position.map((p: any) => {
        const house = calculateHouse(ascRasiId, p.rasi.id);
        const nav = calculateNavamsha(p.longitude);
        return {
          name: p.name,
          rasi: { name: p.rasi.name },
          degree: p.longitude?.toFixed(2),
          house,
          navamsa: nav.sign,
          pada: nav.pada,
        };
      });
    }

    // ✅ ग्रहहरूको शड्बला निकाल्ने
    let shadbalaData: any[] = [];
    if (Array.isArray(planet?.planet_position)) {
      shadbalaData = planet.planet_position
        .filter((p: any) => p.name !== 'Ascendant')
        .map((p: any) => calculateShadbalaForPlanet(p, ascRasiId));
    }

    // ✅ Response
    return NextResponse.json({
      lagna: lagnaSign,
      chandra: chandraSign,
      mangal: kundli?.mangal_dosha?.has_dosha
        ? kundli.mangal_dosha.description
        : 'मङ्गल दोष छैन',
      planets: planetsWithDetails,
      dasha: Array.isArray(dasha?.dasha_periods) ? dasha.dasha_periods.slice(0, 5) : [],
      shadbala: shadbalaData, // ⭐ अब Frontend मा 6 बल देखिन्छ
    });
  } catch (e) {
    console.error('❌ Astro Summary API Error:', e);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
