type Coordinates = { latitude: number; longitude: number };

const cache = new Map<string, Coordinates>();

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const localGazetteer: Array<{ aliases: string[]; coords: Coordinates }> = [
  { aliases: ["nairobi cbd", "cbd", "city centre", "downtown", "cbd bus station"], coords: { latitude: -1.286389, longitude: 36.817223 } },
  { aliases: ["westlands"], coords: { latitude: -1.2676, longitude: 36.8108 } },
  { aliases: ["parklands"], coords: { latitude: -1.2617, longitude: 36.8089 } },
  { aliases: ["museum hill", "museum"], coords: { latitude: -1.2724, longitude: 36.8117 } },
  { aliases: ["pangani"], coords: { latitude: -1.2753, longitude: 36.8422 } },
  { aliases: ["thika road", "thika superhighway"], coords: { latitude: -1.2506, longitude: 36.8734 } },
  { aliases: ["kasarani"], coords: { latitude: -1.2213, longitude: 36.8968 } },
  { aliases: ["roysambu"], coords: { latitude: -1.2103, longitude: 36.8868 } },
  { aliases: ["upper hill", "upperhill"], coords: { latitude: -1.2975, longitude: 36.8156 } },
  { aliases: ["kilimani"], coords: { latitude: -1.2893, longitude: 36.7838 } },
  { aliases: ["yaya", "yaya centre"], coords: { latitude: -1.2921, longitude: 36.7849 } },
  { aliases: ["hurlingham"], coords: { latitude: -1.2987, longitude: 36.7998 } },
  { aliases: ["lavington"], coords: { latitude: -1.2832, longitude: 36.768 } },
  { aliases: ["kileleshwa"], coords: { latitude: -1.2804, longitude: 36.7826 } },
  { aliases: ["south b", "southb"], coords: { latitude: -1.3168, longitude: 36.8454 } },
  { aliases: ["south c", "southc"], coords: { latitude: -1.3205, longitude: 36.8268 } },
  { aliases: ["mombasa road"], coords: { latitude: -1.319, longitude: 36.8824 } },
  { aliases: ["embakasi"], coords: { latitude: -1.3152, longitude: 36.8943 } },
  { aliases: ["jkia", "airport", "jomo kenyatta international airport"], coords: { latitude: -1.3192, longitude: 36.9278 } },
  { aliases: ["langata"], coords: { latitude: -1.3612, longitude: 36.7627 } },
  { aliases: ["karen"], coords: { latitude: -1.3196, longitude: 36.7073 } },
  { aliases: ["dagoretti"], coords: { latitude: -1.3004, longitude: 36.7392 } },
  { aliases: ["kasarani", "garden city"], coords: { latitude: -1.2305, longitude: 36.8781 } },
  { aliases: ["galleria", "galleria mall"], coords: { latitude: -1.3331, longitude: 36.7487 } },
  { aliases: ["sarit", "sarit centre"], coords: { latitude: -1.2622, longitude: 36.8049 } },
  { aliases: ["uhuru park"], coords: { latitude: -1.2899, longitude: 36.8171 } },
];

const localLookup = (locationName: string) => {
  const normalized = normalize(locationName);
  const found = localGazetteer.find((item) => item.aliases.some((alias) => normalized === alias || normalized.includes(alias)));
  return found?.coords;
};

export const pipelineGeocodeService = {
  async geocodeLocation(locationName: string): Promise<Coordinates> {
    const normalizedName = normalize(locationName);
    if (cache.has(normalizedName)) return cache.get(normalizedName)!;

    const localMatch = localLookup(locationName);
    if (localMatch) {
      cache.set(normalizedName, localMatch);
      return localMatch;
    }

    const query = encodeURIComponent(locationName.includes("Nairobi") ? locationName : `${locationName}, Nairobi, Kenya`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&addressdetails=1`;
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "lindamwananchi/1.0 (safety navigation academic project)" },
      });
      if (!response.ok) throw new Error("Geocoding failed");
      const data = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
      const ranked = data
        .map((item) => ({
          latitude: Number(item.lat),
          longitude: Number(item.lon),
          score:
            (item.display_name?.toLowerCase().includes("nairobi") ? 5 : 0) +
            (item.display_name?.toLowerCase().includes(normalizedName) ? 4 : 0),
        }))
        .sort((a, b) => b.score - a.score);

      if (!ranked[0]) throw new Error("No geocode result");

      const coords = { latitude: ranked[0].latitude, longitude: ranked[0].longitude };
      cache.set(normalizedName, coords);
      return coords;
    } catch {
      const fallback = localLookup("nairobi cbd") ?? { latitude: -1.286389, longitude: 36.817223 };
      cache.set(normalizedName, fallback);
      return fallback;
    }
  },
};
