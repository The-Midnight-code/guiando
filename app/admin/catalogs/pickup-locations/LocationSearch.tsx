"use client";

import { useState } from "react";

interface LocationSearchProps {
  query: string;
  onLocationFound: (
    latitude: number,
    longitude: number,
    address: string,
  ) => void;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function LocationSearch({
  query,
  onLocationFound,
}: LocationSearchProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const searchQuery = query.trim();

    if (!searchQuery) {
      setError("Enter an address first.");
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to search location.");
      }

      const searchResults: SearchResult[] = await response.json();

      if (searchResults.length === 0) {
        setError("Location not found.");
        return;
      }

      setResults(searchResults);
    } catch (err) {
      console.error(err);
      setError("Unable to search for this location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onLocationFound(
      Number(result.lat),
      Number(result.lon),
      result.display_name,
    );

    setResults([]);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSearch}
        disabled={isSearching}
        className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-card-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSearching ? "Searching..." : "Search Address"}
      </button>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="overflow-hidden rounded-md border bg-card">
          {results.map((result) => (
            <button
              key={`${result.lat}-${result.lon}`}
              type="button"
              onClick={() => handleSelectResult(result)}
              className="block w-full border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-card-secondary"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
