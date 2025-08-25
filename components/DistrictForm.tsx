'use client';

import { useEffect, useMemo, useState } from 'react';

interface District {
  id: string;
  districtName: string;
  latitude: string;
  longitude: string;
  timezone: string;
  timeDifference?: string;
}

const FALLBACK: District[] = [
  { id: 'ktm', districtName: 'Kathmandu', latitude: '27.7172', longitude: '85.3240', timezone: 'Asia/Kathmandu' },
  { id: 'lalitpur', districtName: 'Lalitpur', latitude: '27.6644', longitude: '85.3188', timezone: 'Asia/Kathmandu' },
  { id: 'bhaktapur', districtName: 'Bhaktapur', latitude: '27.6710', longitude: '85.4298', timezone: 'Asia/Kathmandu' },
];

export default function DistrictForm() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/districts', { cache: 'no-store' });
        const data = await res.json();

        // Accept multiple possible shapes:
        //  - [{...}, {...}]
        //  - { districts: [{...}] }
        //  - { data: [{...}] }
        const list: unknown =
          Array.isArray(data) ? data :
          Array.isArray((data as any)?.districts) ? (data as any).districts :
          Array.isArray((data as any)?.data) ? (data as any).data :
          null;

        if (!list || !Array.isArray(list)) {
          throw new Error('Invalid districts payload');
        }

        if (alive) {
          setDistricts(list as District[]);
        }
      } catch (e) {
        console.error('Districts fetch failed → using fallback', e);
        setErr('Could not load districts. Using fallback.');
        if (alive) setDistricts(FALLBACK);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const selectedDistrict = useMemo(
    () => districts.find((d) => d.id === selectedId) || null,
    [districts, selectedId]
  );

  return (
    <div className="space-y-2">
      <label htmlFor="district" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
        Select Birth Place
      </label>

      <select
        id="district"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        disabled={loading}
        className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:bg-zinc-800 dark:border-zinc-600"
      >
        <option value="" disabled>
          {loading ? 'Loading…' : 'Select birth place'}
        </option>

        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.districtName}
          </option>
        ))}
      </select>

      {err && <p className="text-xs text-amber-600">{err}</p>}
      {!loading && districts.length === 0 && (
        <p className="text-xs text-red-500">No districts available.</p>
      )}

      {/* Hidden fields only when a district is selected */}
      {selectedDistrict && (
        <>
          <input type="hidden" name="place" value={selectedDistrict.districtName} />
          <input type="hidden" name="latitude" value={selectedDistrict.latitude} />
          <input type="hidden" name="longitude" value={selectedDistrict.longitude} />
          <input type="hidden" name="timezone" value={selectedDistrict.timezone} />
        </>
      )}
    </div>
  );
}
