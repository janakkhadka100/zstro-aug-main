// ✅ ग्रहको house position क्याल्कुलेट गर्ने
// ascRasiId = लग्नको राशी नम्बर (१–१२)
// planetRasiId = ग्रहको राशी नम्बर (१–१२)
export function calculateHouse(ascRasiId: number, planetRasiId: number): number {
  // House = (PlanetRasi - AscRasi + 12) % 12 + 1
  return ((planetRasiId - ascRasiId + 12) % 12) + 1;
}

// ✅ नवमांश (Navamsha) निकाल्ने (longitude बाट)
// longitude = ग्रहको longitude (०° – ३६०°)
export function calculateNavamsha(longitude: number): { sign: string; pada: number } {
  const rasiIndex = Math.floor(longitude / 30);  // 0–11
  const degInRasi = longitude % 30;             // 0–30°

  // Each Navamsa = 3°20′ = 3.333°
  const navamsaIndex = Math.floor(degInRasi / (10 / 3)); // 0–8
  const pada = navamsaIndex + 1;

  const base = rasiIndex + 1; // 1–12
  let startSign: number;

  if ([1, 4, 7, 10].includes(base)) {
    startSign = base; // movable
  } else if ([2, 5, 8, 11].includes(base)) {
    startSign = ((base + 8 - 1) % 12) + 1; // fixed → 9th sign
  } else {
    startSign = ((base + 4 - 1) % 12) + 1; // dual → 5th sign
  }

  const navamsaSign = ((startSign - 1 + navamsaIndex) % 12) + 1;

  const signNames = [
    "Mesha",      // 1
    "Vrishabha",  // 2
    "Mithuna",    // 3
    "Karka",      // 4
    "Simha",      // 5
    "Kanya",      // 6
    "Tula",       // 7
    "Vrischika",  // 8
    "Dhanu",      // 9
    "Makara",     // 10
    "Kumbha",     // 11
    "Meena"       // 12
  ];

  return {
    sign: signNames[navamsaSign - 1],
    pada
  };
}
