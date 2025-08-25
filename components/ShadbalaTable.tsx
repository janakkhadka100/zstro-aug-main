'use client';

import React from 'react';

// 👉 शडबलाको डेटा प्रकार
interface Shadbala {
  planet: string;
  sthanabala: number;
  digbala: number;
  kalabala: number;
  cheshtabala: number;
  naisargika: number;
  total: number;
}

interface Props {
  shadbala: Shadbala[];
}

export default function ShadbalaTable({ shadbala }: Props) {
  return (
    <div className="mt-4 bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 text-black dark:text-white">
      <h3 className="text-lg font-bold mb-3 text-green-700 dark:text-green-300">
        📊 ग्रहहरूको षड्बल तालिका
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200 dark:bg-zinc-800">
              <th className="border px-2 py-1">ग्रह</th>
              <th className="border px-2 py-1">स्थानबल</th>
              <th className="border px-2 py-1">दिक्‍बल</th>
              <th className="border px-2 py-1">कालबल</th>
              <th className="border px-2 py-1">चेष्टबल</th>
              <th className="border px-2 py-1">नैसर्गिक बल</th>
              <th className="border px-2 py-1">कुल बल</th>
            </tr>
          </thead>
          <tbody>
            {shadbala.map((row, idx) => (
              <tr key={idx} className="odd:bg-gray-50 dark:odd:bg-zinc-800">
                <td className="border px-2 py-1 text-center">{row.planet}</td>
                <td className="border px-2 py-1 text-center">{row.sthanabala}</td>
                <td className="border px-2 py-1 text-center">{row.digbala}</td>
                <td className="border px-2 py-1 text-center">{row.kalabala}</td>
                <td className="border px-2 py-1 text-center">{row.cheshtabala}</td>
                <td className="border px-2 py-1 text-center">{row.naisargika}</td>
                <td className="border px-2 py-1 text-center font-bold text-green-700 dark:text-green-300">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
