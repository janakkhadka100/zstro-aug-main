// 📂 src/helpers/convertLagna.ts
export function convertLagna(lagnaRaw: any): number {
  if (lagnaRaw === null || lagnaRaw === undefined) {
    console.warn("⚠️ convertLagna: lagnaRaw is null/undefined");
    return 1;
  }

  // 👉 यदि backend ले object पठायो भने
  let lagnaStr: any = lagnaRaw;
  if (typeof lagnaRaw === "object" && lagnaRaw.name) {
    lagnaStr = lagnaRaw.name;
  }

  // 👉 यदि backend ले number पठायो भने
  if (typeof lagnaStr === "number") {
    // 1–12 नै valid number मानिन्छ
    if (lagnaStr >= 1 && lagnaStr <= 12) {
      return lagnaStr;
    } else {
      console.warn("⚠️ convertLagna: unexpected number:", lagnaStr);
      return 1;
    }
  }

  // 👉 अब string मात्र handle गर्ने
  if (typeof lagnaStr !== "string") {
    console.warn("⚠️ convertLagna: lagnaStr not string:", lagnaStr);
    return 1;
  }

  lagnaStr = lagnaStr.trim();

  const signMap: Record<string, number> = {
    Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4,
    Leo: 5, Virgo: 6, Libra: 7, Scorpio: 8,
    Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12,
    मेष: 1, वृषभ: 2, मिथुन: 3, कर्कट: 4,
    सिंह: 5, कन्या: 6, तुला: 7, वृश्चिक: 8,
    धनु: 9, मकर: 10, कुम्भ: 11, मीन: 12,
    Mesha: 1, Vrishabha: 2, Mithuna: 3, Karkata: 4,
    Simha: 5, Kanya: 6, Tula: 7, Vrischika: 8,
    Dhanu: 9, Makara: 10, Kumbha: 11, Meena: 12,
  };

  // direct lookup
  if (signMap[lagnaStr] !== undefined) {
    return signMap[lagnaStr];
  }

  // normalize first letter
  const normalized =
    lagnaStr.charAt(0).toUpperCase() + lagnaStr.slice(1).toLowerCase();
  if (signMap[normalized] !== undefined) {
    return signMap[normalized];
  }

  console.warn("⚠️ convertLagna: unknown lagna string:", lagnaStr);
  return 1;
}
