// Nominatim (OpenStreetMap) geocoding — free, no API key, 1 req/sec limit
export async function geocodeAddress(
  address: string,
  city: string,
  state: string
): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${address}, ${city}, ${state}, USA`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "rbar-seeder/1.0" },
    });

    if (!res.ok) {
      console.warn(`Geocoding HTTP error ${res.status} for: ${address}, ${city}, ${state}`);
      return null;
    }

    const data = (await res.json()) as Array<{ lat: string; lon: string }>;

    if (!data.length) {
      console.warn(`Geocoding: no results for: ${address}, ${city}, ${state}`);
      return null;
    }

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (err) {
    console.warn(`Geocoding error for: ${address}, ${city}, ${state}`, err);
    return null;
  }
}
