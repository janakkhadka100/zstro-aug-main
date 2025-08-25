'use client';
import React from 'react';
import NorthIndianChart from '@/components/NorthIndianChart';
import ShadbalaTable from '@/components/ShadbalaTable';
import { convertLagna } from '@/helpers/convertLagna';

interface Planet {
  name: string;
  rasi?: { name: string };
  longitude?: number;
}

interface Dasha {
  name: string;
  start: string;
  end: string;
}

interface Shadbala {
  planet: string;
  sthanabala: number;
  digbala: number;
  kalabala: number;
  cheshtabala: number;
  naisargika: number;
  total: number;
}

interface AstroSummary {
  lagna: string;
  chandra?: string;
  mangal?: string;
  planets: Planet[];
  shadbala?: Shadbala[];
  dasha: Dasha[];
}

interface UserModalProps {
  user: Partial<Record<string, any>>;
  isOpen: boolean;
  onClose: () => void;
  astroSummary?: AstroSummary | null;
}

const fieldLabels: Record<string, string> = {
  name: 'Full Name',
  email: 'Email',
  gender: 'Gender',
  dob: 'Date of Birth',
  time: 'Time of Birth',
  latitude: 'Latitude',
  longitude: 'Longitude',
  timezone: 'Time Zone',
  place: 'Place of Birth',
};

const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose, astroSummary }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg shadow-lg w-full max-w-6xl p-6 relative animate-fadeIn max-h-[100vh]">
        <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side – User Info */}
          <div className="w-full lg:w-2/5 space-y-7">
            {Object.entries(fieldLabels).map(([key, label]) => (
              <div key={key} className="flex justify-between text-sm border-b pb-1">
                <span className="font-semibold">{label}</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatValue(key, user[key])}
                </span>
              </div>
            ))}
          </div>

          {/* Right Side – Astro Summary */}
          <div className="w-full lg:w-3/5 max-h-[70vh] overflow-y-auto pr-2">
            {astroSummary ? (
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-zinc-800 dark:to-zinc-700 border border-green-200 dark:border-green-600">
                <h2 className="text-xl font-bold mb-4 text-green-800 dark:text-green-300">
                  🧘 जन्मकुण्डली सारांश
                </h2>

                {/* North Indian Chart */}
                <NorthIndianChart
                  lagna={convertLagna(astroSummary.lagna)}
                  planets={astroSummary.planets}
                />

                {/* Shadbala Table */}
                {Array.isArray(astroSummary.shadbala) && astroSummary.shadbala.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-300">
                      📊 षड्बल तालिका
                    </h3>
                    <ShadbalaTable shadbala={astroSummary.shadbala} />
                  </div>
                )}

                {/* Lagna & Chandra */}
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow">
                    <p className="text-sm text-gray-500">🌅 लग्न</p>
                    <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                      {astroSummary.lagna || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow">
                    <p className="text-sm text-gray-500">🌙 चन्द्र राशि</p>
                    <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                      {astroSummary.chandra || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Mangal Dosha */}
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500 mb-4">
                  <p className="text-sm text-red-700 font-bold">🔥 मङ्गल दोष</p>
                  <p className="text-sm mt-1">
                    {astroSummary.mangal || 'मङ्गल दोष छैन।'}
                  </p>
                </div>

                {/* Planets */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">🪐 ग्रह स्थिति</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    {astroSummary.planets.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow"
                      >
                        <span className="font-medium">{p.name}</span>: {p.rasi?.name}{' '}
                        {p.longitude !== undefined ? `(${p.longitude.toFixed(2)}°)` : ''}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dasha */}
                <div>
                  <h3 className="font-semibold mb-2">📜 महादशा</h3>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    {astroSummary.dasha.map((d, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{d.name}</span> (
                        {new Date(d.start).toLocaleDateString()} →{' '}
                        {new Date(d.end).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Loading astro summary...
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Format value utility
function formatValue(key: string, value: string | null | undefined): string {
  if (!value) return 'N/A';
  if (key === 'gender') return value.charAt(0).toUpperCase() + value.slice(1);
  if (key === 'resetTokenExpiry') return new Date(value).toLocaleString();
  return value;
}

export default UserModal;
