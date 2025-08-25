'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LocationSearch({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lon: number }[]>([]);

  // Function to trigger search when location changes
  const searchLocation = async (locationQuery: string) => {
    if (!locationQuery.trim()) return;

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&countrycodes=NP`
      );

      if (response.data.length > 0) {
        // Set suggestions for user to choose from
        const places = response.data.map((place: any) => ({
          label: place.display_name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
        }));
        setSuggestions(places);
      } else {
        setError('No locations found in Nepal');
      }
    } catch (error) {
      setError('Error searching location');
    }

    setLoading(false);
  };

  // Trigger search every time location changes
  useEffect(() => {
    if (location.trim()) {
      const timeoutId = setTimeout(() => searchLocation(location), 500); // Delay for better UX
      return () => clearTimeout(timeoutId);
    }
  }, [location]);

  // Handle selecting a suggestion
  const handleSelectLocation = (lat: number, lon: number, label: string) => {
    setLocation(label); // Update input field with selected place name
    onSelect(lat, lon); // Pass selected lat and lon to parent component
    setSuggestions([]); // Clear suggestions after selection
  };

  // Handle input change, show suggestions while typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    if (e.target.value.trim()) {
      searchLocation(e.target.value);
    } else {
      setSuggestions([]); // Clear suggestions if input is empty
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
        Birth Place
        <input
          type="text"
          name="place"
          value={location}
          onChange={handleInputChange} // Update the input and fetch suggestions on change
          placeholder="Enter Birth city or address "
          className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:bg-zinc-800 dark:border-zinc-600"
        />
      </label>
      <button
        type="button"
        onClick={() => searchLocation(location)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Display Suggestions only while typing */}
      {suggestions.length > 0 && location.trim() && (
        <ul className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white dark:bg-zinc-800">
          {suggestions.map((place, index) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-zinc-700"
              onClick={() => handleSelectLocation(place.lat, place.lon, place.label)} // Pass lat, lon, and label
            >
              {place.label}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
