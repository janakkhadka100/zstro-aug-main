'use client';

import React from "react";
import { convertLagna } from "@/helpers/convertLagna";

interface Planet {
  name: string;
  rasi?: { name: string } | string;
}

interface Props {
  lagna: any;          // backend बाट आएको लग्नको नाम (string or object)
  planets?: Planet[];
}

// राशी नम्बरबाट नाम
const signNames: Record<number, string> = {
  1: "Aries", 2: "Taurus", 3: "Gemini", 4: "Cancer",
  5: "Leo", 6: "Virgo", 7: "Libra", 8: "Scorpio",
  9: "Sagittarius", 10: "Capricorn", 11: "Aquarius", 12: "Pisces",
};

// राशीको मालिक
const signLord: Record<number, string> = {
  1: "मंगल", 2: "शुक्र", 3: "बुध", 4: "चन्द्र",
  5: "सूर्य", 6: "बुध", 7: "शुक्र", 8: "मंगल",
  9: "गुरु", 10: "शनि", 11: "शनि", 12: "गुरु",
};

// घरको अर्थ
const houseMeaning: Record<number, string> = {
  1: "स्वभाव, शरीर, व्यक्तित्व",
  2: "धन, परिवार, वाणी",
  3: "साहस, भाइबहिनी",
  4: "घर, माता, सुख",
  5: "सन्तान, शिक्षा",
  6: "रोग, ऋण, शत्रु",
  7: "विवाह, जोडीदार",
  8: "आयु, गुप्त कुरा",
  9: "धर्म, भाग्य",
  10: "कर्म, व्यापार",
  11: "आय, मित्र",
  12: "खर्च, विदेश",
};

// signMap for planets
const signMap: Record<string, number> = {
  Aries:1,Taurus:2,Gemini:3,Cancer:4,Leo:5,Virgo:6,Libra:7,Scorpio:8,
  Sagittarius:9,Capricorn:10,Aquarius:11,Pisces:12,
  Mesha:1,Vrishabha:2,Mithuna:3,Karkata:4,Simha:5,Kanya:6,Tula:7,Vrischika:8,
  Dhanu:9,Makara:10,Kumbha:11,Meena:12,
  // Nepali
  "मेष":1,"वृषभ":2,"मिथुन":3,"कर्कट":4,"सिंह":5,"कन्या":6,"तुला":7,"वृश्चिक":8,
  "धनु":9,"मकर":10,"कुम्भ":11,"मीन":12
};

const planetNameMap: Record<string,string> = {
  Sun:"सूर्य", Moon:"चन्द्र", Mars:"मंगल", Mercury:"बुध",
  Jupiter:"गुरु", Venus:"शुक्र", Saturn:"शनि", Rahu:"राहु", Ketu:"केतु", Ascendant:"लग्न"
};

export default function HouseTable({ lagna, planets = [] }: Props) {
  // ✅ Backend बाट आएको लग्न → नम्बर
  const lagnaNo = convertLagna(lagna);
  console.log("📌 Raw lagna from backend:", lagna);
  console.log("✅ Normalized Lagna No:", lagnaNo);

  // ✅ लग्नबाट सुरु गरेर clockwise घरहरूको क्रम
  const houseRasiNumbers: number[] = [];
  for (let i = 0; i < 12; i++) {
    let num = lagnaNo + i;
    if (num > 12) num -= 12;
    houseRasiNumbers.push(num);
  }

  // ✅ ग्रहहरू कुन घरमा पर्छन्
  const planetsInHouse: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) planetsInHouse[i] = [];

  planets.forEach((p) => {
    const rasiName = typeof p.rasi === "string" ? p.rasi : (p.rasi as any)?.name;
    const rasiNo = signMap[rasiName ?? ""];
    if (rasiNo) {
      const houseIndex = houseRasiNumbers.findIndex((r) => r === rasiNo);
      if (houseIndex >= 0) {
        planetsInHouse[houseIndex + 1].push(planetNameMap[p.name] || p.name);
      }
    }
  });

  return (
    <div className="p-4 my-4 bg-white rounded-md shadow-md text-black">
      <h2 className="text-lg font-bold mb-3">📝 ग्रहस्थिति तालिका</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">घर</th>
              <th className="border px-2 py-1">राशी</th>
              <th className="border px-2 py-1">मालिक ग्रह</th>
              <th className="border px-2 py-1">ग्रहहरू</th>
              <th className="border px-2 py-1">अर्थ</th>
            </tr>
          </thead>
          <tbody>
            {houseRasiNumbers.map((rasiNo, idx) => (
              <tr key={idx} className="odd:bg-gray-50">
                <td className="border px-2 py-1 text-center">
                  {idx + 1} {idx === 0 ? "(लग्न)" : ""}
                </td>
                <td className="border px-2 py-1 text-center">
                  {signNames[rasiNo]} ({rasiNo})
                </td>
                <td className="border px-2 py-1 text-center">
                  {signLord[rasiNo]}
                </td>
                <td className="border px-2 py-1 text-center">
                  {planetsInHouse[idx + 1].length > 0
                    ? planetsInHouse[idx + 1].join(", ")
                    : "—"}
                </td>
                <td className="border px-2 py-1">
                  {houseMeaning[idx + 1]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
